﻿/**
 * author - lijing00333@163.com 拔赤
 */
KISSY.add('calendar-page',function(S){
	S.Calendar = S.Calendar || new Function;
	S.mix(S.Calendar.prototype,{
		Page:function(config,fathor){
			/**
			 * 子日历构造器
			 * @constructor S.Calendar.prototype.Page
			 * @param {object} config ,参数列表，需要指定子日历所需的年月
			 * @param {object} fathor,指向Y.Calendar实例的指针，需要共享父框的参数
			 * @return 子日历的实例
			 */
		
			//属性
			this.fathor = fathor;
			this.month = Number(config.month);
			this.year = Number(config.year);
			this.prev_arrow = config.prev_arrow;
			this.next_arrow = config.next_arrow;
			this.node = null;
			this.timmer = null;//时间选择的实例
			this.id = '';
			this.EV = [];
			this.html = [
				'<div class="ks-cal-box" id="{$id}">',
					'<div class="ks-cal-hd">', 
						'<a href="javascript:void(0);" class="prev {$prev}"><</a>',
						'<a href="javascript:void(0);" class="title">{$title}</a>',
						'<a href="javascript:void(0);" class="next {$next}">></a>',
					'</div>',
					'<div class="ks-cal-bd">',
						'<div class="whd">',
						/*
							'<span>日</span>',
							'<span>一</span>',
							'<span>二</span>',
							'<span>三</span>',
							'<span>四</span>',
							'<span>五</span>',
							'<span>六</span>',
						*/
							fathor._handleOffset().day_html,
						'</div>',
						'<div class="dbd ks-clearfix">',
							'{$ds}',
							/*
							<a href="" class="null">1</a>
							<a href="" class="disabled">3</a>
							<a href="" class="selected">1</a>
							<a href="" class="today">1</a>
							<a href="">1</a>
						*/
						'</div>',
					'</div>',
					'<div class="ks-setime hidden">',
					'</div>',
					'<div class="ks-cal-ft {$showtime}">',
						'<div class="ks-cal-time">',
							'时间：00:00 	&hearts;',
						'</div>',
					'</div>',
					'<div class="ks-selectime hidden"><!--用以存放点选时间的一些关键值-->',
					'</div>',
				'</div><!--#ks-cal-box-->'
			].join("");
			this.nav_html = [
					'<p>',
					'月',
						'<select value="{$the_month}">',
							'<option class="m1" value="1">01</option>',
							'<option class="m2" value="2">02</option>',
							'<option class="m3" value="3">03</option>',
							'<option class="m4" value="4">04</option>',
							'<option class="m5" value="5">05</option>',
							'<option class="m6" value="6">06</option>',
							'<option class="m7" value="7">07</option>',
							'<option class="m8" value="8">08</option>',
							'<option class="m9" value="9">09</option>',
							'<option class="m10" value="10">10</option>',
							'<option class="m11" value="11">11</option>',
							'<option class="m12" value="12">12</option>',
						'</select>',
					'</p>',
					'<p>',
					'年',
						'<input type="text" value="{$the_year}" onfocus="this.select()"></input>',
					'</p>',
					'<p>',
						'<button class="ok">确定</button><button class="cancel">取消</button>',
					'</p>'
			].join("");


			//方法
			//常用的数据格式的验证
			this.Verify = function(){

				var isDay = function(n){
					if(!/\d+/i.test(n))return false;
					n = Number(n);
					if(n < 1 || n > 31){
						return false;
					}
					return true;
				},
				isYear = function(n){
					if(!/\d+/i.test(n))return false;
					n = Number(n);
					if(n < 100 || n > 10000){
						return false;
					}
					return true;
				},
				isMonth = function(n){
					if(!/\d+/i.test(n))return false;
					n = Number(n);
					if(n < 1 || n > 12){
						return false;
					}
					return true;

				};

				return {
					isDay:isDay,
					isYear:isYear,
					isMonth:isMonth

				};


			};

			/**
			 * 渲染子日历的UI
			 */
			this._renderUI = function(){
				var cc = this,_o={},ft;
				cc.HTML = '';
				_o.prev = '';
				_o.next = '';
				_o.title = '';
				_o.ds = '';
				if(!cc.prev_arrow){
					_o.prev = 'hidden';
				}
				if(!cc.next_arrow){
					_o.next = 'hidden';
				}
				if(!cc.fathor.showtime){
					_o.showtime = 'hidden';
				}
				_o.id = cc.id = 'ks-cal-'+Math.random().toString().replace(/.\./i,'');
				_o.title = cc.fathor._getHeadStr(cc.year,cc.month);
				cc.createDS();
				_o.ds = cc.ds;
				cc.fathor.con.append(cc.fathor._templetShow(cc.html,_o));
				cc.node = S.one('#'+cc.id);
				if(cc.fathor.showTime){
					ft = cc.node.one('.ks-cal-ft');
					ft.removeClass('hidden');
					cc.timmer = new cc.fathor.TimeSelector(ft,cc.fathor);
				}
				return this;
			};
			/**
			 * 创建子日历的事件
			 */
			this._buildEvent = function(){
				var cc = this,i,
					con = S.one('#'+cc.id);
				//flush event
				for(i = 0;i<cc.EV.length;i++){
					if(typeof cc.EV[i] != 'undefined'){
						cc.EV[i].detach();
					}
				}

				cc.EV[0] = con.one('div.dbd').on('click',function(e){
					e.preventDefault();
					e.target = S.Node(e.target);
					if(e.target.hasClass('null'))return;
					if(e.target.hasClass('disabled'))return;
					var selectedd = Number(e.target.html());
					var d = new Date();
					d.setDate(selectedd);
					d.setMonth(cc.month);
					d.setYear(cc.year);
					//self.callback(d);
					//datetime的date
					cc.fathor.dt_date = d;
					cc.fathor.fire('select',{
						date:d
					});
					if(cc.fathor.popup && cc.fathor.closable){
						cc.fathor.hide();
					}
					if(cc.fathor.rangeSelect){
						cc.fathor._handleRange(d);
					}
					cc.fathor.render({selected:d});
				});
				//向前
				cc.EV[1] = con.one('a.prev').on('click',function(e){
					e.preventDefault();
					cc.fathor._monthMinus().render();
					cc.fathor.fire('monthChange',{
						date:new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01')
					});

				});
				//向后
				cc.EV[2] = con.one('a.next').on('click',function(e){
					e.preventDefault();
					cc.fathor._monthAdd().render();
					cc.fathor.fire('monthChange',{
						date:new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01')
					});
				});
				if(cc.fathor.navigator){
					cc.EV[3] = con.one('a.title').on('click',function(e){
						try{
							cc.timmer.hidePopup();
							e.preventDefault();
						}catch(e){}
						e.target = S.Node(e.target);
						var setime_node = con.one('.ks-setime');
						setime_node.html('');
						var in_str = cc.fathor._templetShow(cc.nav_html,{
							the_month:cc.month+1,
							the_year:cc.year
						});
						setime_node.html(in_str);
						setime_node.removeClass('hidden');
						con.one('input').on('keydown',function(e){
							e.target = S.Node(e.target);
							if(e.keyCode == 38){//up
								e.target.val(Number(e.target.val())+1);
								//TODO 我期望直接调用e.target.select
								e.target[0].select();
							}
							if(e.keyCode == 40){//down
								e.target.val(Number(e.target.val())-1);
								e.target[0].select();
							}
							if(e.keyCode == 13){//enter
								var _month = con.one('.ks-setime').one('select').val();
								var _year  = con.one('.ks-setime').one('input').val();
								con.one('.ks-setime').addClass('hidden');
								if(!cc.Verify().isYear(_year))return;
								if(!cc.Verify().isMonth(_month))return;
								cc.fathor.render({
									date:new Date(_year+'/'+_month+'/01')
								})
								cc.fathor.fire('monthChange',{
									date:new Date(_year+'/'+_month+'/01')
								});
							}
						});
					});
					cc.EV[4] = con.one('.ks-setime').on('click',function(e){
						e.preventDefault();
						e.target = S.Node(e.target);
						if(e.target.hasClass('ok')){
							var _month = con.one('.ks-setime').one('select').val(),
								_year  = con.one('.ks-setime').one('input').val();
							con.one('.ks-setime').addClass('hidden');
							if(!cc.Verify().isYear(_year))return;
							if(!cc.Verify().isMonth(_month))return;
							cc.fathor.render({
								date:new Date(_year+'/'+_month+'/01')
							})
							cc.fathor.fire('monthChange',{
								date:new Date(_year+'/'+_month+'/01')
							});
						}else if(e.target.hasClass('cancel')){
							con.one('.ks-setime').addClass('hidden');
						}
					});
				}
				return this;

			};
			/**
			 * 得到当前子日历的node引用
			 */
			this._getNode = function(){
				var cc = this;
				return cc.node;
			};
			/**
			 * 得到某月有多少天,需要给定年来判断闰年
			 */
			this._getNumOfDays = function(year,month){
				return 32-new Date(year,month-1,32).getDate();
			};
			/**
			 * 生成日期的html
			 */
			this.createDS = function(){
				var cc = this;

				var s = '';
				var startweekday = (new Date(cc.year+'/'+(cc.month+1)+'/01').getDay() + cc.fathor.startDay + 7)%7;//当月第一天是星期几
				var k = cc._getNumOfDays(cc.year,cc.month + 1) + startweekday;
				
				for(var i = 0;i< k;i++){
					//prepare data {{
					if(/532/.test(S.UA.webkit)){//hack for chrome
						var _td_s = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+1-startweekday).toString());
					}else {
						var _td_s = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+2-startweekday).toString());
					}
					var _td_e = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+1-startweekday).toString());
					//prepare data }}
					if(i < startweekday){//null
						s += '<a href="javascript:void(0);" class="null">0</a>';
					}else if( cc.fathor.minDate instanceof Date
								&& new Date(cc.year+'/'+(cc.month+1)+'/'+(i+2-startweekday)).getTime() < (cc.fathor.minDate.getTime()+1)  ){//disabled
						s+= '<a href="javascript:void(0);" class="disabled">'+(i - startweekday + 1)+'</a>';
						
					}else if(cc.fathor.maxDate instanceof Date
								&& new Date(cc.year+'/'+(cc.month+1)+'/'+(i+1-startweekday)).getTime() > cc.fathor.maxDate.getTime()  ){//disabled
						s+= '<a href="javascript:void(0);" class="disabled">'+(i - startweekday + 1)+'</a>';


					}else if((cc.fathor.range.start != null && cc.fathor.range.end != null) //日期选择范围
								&& (
									_td_s.getTime()>=cc.fathor.range.start.getTime() && _td_e.getTime() < cc.fathor.range.end.getTime()) ){
								
								//alert(Y.dump(_td_s.getDate()));
								
							if(i == (startweekday + (new Date()).getDate() - 1) 
								&& (new Date()).getFullYear() == cc.year 
								&& (new Date()).getMonth() == cc.month){//今天并被选择
								s+='<a href="javascript:void(0);" class="range today">'+(i - startweekday + 1)+'</a>';
							}else{
								s+= '<a href="javascript:void(0);" class="range">'+(i - startweekday + 1)+'</a>';
							}

					}else if(i == (startweekday + (new Date()).getDate() - 1) 
								&& (new Date()).getFullYear() == cc.year 
								&& (new Date()).getMonth() == cc.month){//today
						s += '<a href="javascript:void(0);" class="today">'+(i - startweekday + 1)+'</a>';

					}else if(i == (startweekday + cc.fathor.selected.getDate() - 1) 
								&& cc.month == cc.fathor.selected.getMonth() 
								&& cc.year == cc.fathor.selected.getFullYear()){//selected
						s += '<a href="javascript:void(0);" class="selected">'+(i - startweekday + 1)+'</a>';
					}else{//other
						s += '<a href="javascript:void(0);">'+(i - startweekday + 1)+'</a>';
					}
				}
				if(k%7 != 0){
					for(var i = 0;i<(7-k%7);i++){
						s += '<a href="javascript:void(0);" class="null">0</a>';
					}
				}
				cc.ds = s;
				return this;
			};
			/**
			 * 渲染 
			 */
			this.render = function(){
				var cc = this;
				cc._renderUI();
				cc._buildEvent();
				return this;
			};


		}//Page constructor over
	});

});