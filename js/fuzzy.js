/**
 * @author wangming
 * 基于jquery的模糊查询插件
 * 目前的是伪模糊查询，是利用服务器端进行查询。
 * 如果想实现前端的查询，需要略微改动，但是总体思路相同。
 */
(function($) {
	$.fn.fuzzy = function(opt) {
		 "use strict";
		 var defaults={
				initCount:10,
				url:""
		};
		var opts=$.extend(defaults, opt);
		var _this=$(this);
		var methods = {
			init:function(){
				methods.bind();
				methods.search(true);
			},
			bind:function(){
				//去后台查询
				_this.keyup(function(e){
					e.stopPropagation();
					var selected=_this.next("ul").find("li[selected]")
					if(e.keyCode==38){//up
						selected.prev("li").attr("selected","selected").addClass("lihover");
						selected.removeClass("lihover").removeAttr("selected");
						var value=_this.next("ul").find("li[selected]").text();
						if(!!value){_this.val(value);}
					}else if(e.keyCode==40){//down
						if(selected.length==0){
							_this.next("ul").find("li:eq(0)").addClass("lihover").attr("selected","selected")
						}else{
							selected.next("li").addClass("lihover").attr("selected","selected")
							selected.removeClass("lihover").removeAttr("selected");
						}
						var value=_this.next("ul").find("li[selected]").text();
						if(!!value){_this.val(value);}
					}else{
						methods.search(true);
					}
				});
				//点击其它部分
				$("html body").click(function(e){
					var ftar1=_this.next('ul')[0],ftar2=_this.next('ul li')[0],ftar3=_this[0];
					if(e.target==ftar1||e.target==ftar2||e.target==ftar3){
						//console.log("内容");
					}else{
						_this.next('ul').slideUp();
					}
				});
				//焦点
				//失去焦点事件有bug，故用上面的事件代替。
				_this.focus(function(e){
					var win=_this.outerWidth();
					_this.next('ul').width(win+"px");
					_this.next('ul').slideDown();
					e.stopPropagation();
				});
				//选择
				_this.next("ul").delegate("li","click",function(){
					
					$(this).addClass("lihover").attr("selected","selected")
					$(this).siblings("li").removeClass("lihover").removeAttr("selected");
					
					_this.val($(this).text());
					_this.next('ul').slideUp();
				});
			},
			render:function(data){
				_this.next("ul").empty();
				var htmls=[];
				$.each(data,function(i,o){
					htmls.push("<li value='"+o.id+"'>"+o.name+"</li>");
				});
				_this.next("ul").append(htmls.join(""));
			},
			search:function(searched){
				var key=_this.val();
				if(searched){
					$.ajax({
						url:opts.url,
						dataType:"json",
						type:"GET",
						cache:true,
						data:{name:key},
						success:function(data){
							if(data.success){
								methods.render(data.data);
							}else{
								layer.msg("数据加载失败",{icon:5});
							}
						}
					});
				}
			}
		};
		methods.init();
	};
})(jQuery);