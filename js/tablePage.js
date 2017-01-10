;function showPageMsg(msg){
	layer.msg(msg,{icon:5});
}

/**
 * @author wangming
 * 基于jquery的模糊查询插件
 * 目前的是伪模糊查询，是利用服务器端进行查询。
 * 如果想实现前端的查询，需要略微改动，但是总体思路相同。
 */
(function($) {
	$.MyPage = function(opt) {
		 "use strict";
		 var defaults = {     
			table: '#dataTable', //分页的tableId    
		    page: '#pagination',//分页组件的id
		    pageInfo:"#paginationInfo",//每页显示多少条
		    pageUrl:"",//分页的服务器地址，可以在参数上传或者在分页的组建中传
		    method:"POST",//交互方法
		    form:"#queryForm",//需要提交的form
		    doInit:true,//是否需要初始化查询条件
		    getTable:null,//ajax拼接的table,可以自定义table的样式，也可以使用默认的
		    initback:null,//分页插件初始化完成回掉的方法	
		    initNum:10,//初始化默认每页数量
		};
		var options=$.extend(defaults, opt);
		
		var methods = {
			init:function(){
				methods.search();
			},
			//渲染插件
			renderPage:function(totalPages,currentPage){
				$.jqPaginator(options.page, {
					totalPages:totalPages,
					visiblePages: 5,
					currentPage: currentPage,
					wrapper:'<ul></ul>',
					first: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">首页</a></li>',
					prev: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">上一页</a></li>',
					next: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">下一页</a></li>',
					last: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">尾页</a></li>',
					onPageChange: function (num, type) {
						//插入数据
						if(type=="init"){
							//初始化自定义数据
							return;
						} else{
							methods.search(num);
							//$.MyNewPage.insertHTML(opts,num,pageSize,null);
						}
					}
				});
			},
			render:function(data){
    			$(options.table +" tbody").empty().append(msg);
    			if($(options.table+" tbody tr").length<2){//没有数据
    				var trtd="<tr class='odd'><td colspan='20' class='text-center'>当前没有数据</td></tr>";
    				$(options.table+" tbody").append(trtd);
    				//分页信息展示
        			$(options.pageInfo+" #pagenum").text(1);
        			$(options.pageInfo+" #pages").text(1);
        			$(options.pageInfo+" #allsize").text(0)
        			$(options.pageInfo+" #toPage").val(1);
    			}else{//有数据
    				//分页信息展示
        			$(options.pageInfo+" #pagenum").text($("#pageInfo").data("pagenum"));
        			$(options.pageInfo+" #pages").text($("#pageInfo").data("pages"));
        			$(options.pageInfo+" #allsize").text($("#pageInfo").data("allsize"))
        			$(options.pageInfo+" #toPage").val($("#pageInfo").data("pagenum"));
    			}
    			if(!!options.initback){
    				options.initback();
    			}
    			var totalPages=$(options.table +" #pageInfo").data("pages"),
    				currentPage=$(options.table +" #pageInfo").data("pagenum");
    			methods.renderPage(totalPages,currentPage);
			},
			error:function(status){
				if(status=='timeout'){//超时,status还有success,error等值的情况
         		   showPageMsg("请求超时，请刷新重试......");
         		   return ;
         	   	}
				if(status==400){
					showPageMsg("您提交的数据异常，服务器拒绝响应......");
					return ;
				}else if(status==302){
					showPageMsg("您已掉线，请重新登陆......");
					return ;
				}else if(status==405){
					showPageMsg("请求方法错误，请重新配置......");
					return ;
				}else{
					showPageMsg("加载数据失败，请检查您的网络连接情况......");
					return ;
				}
			},
			param:function(){
				
			},
			search:function(num){
				var param=methods.param()+"&pageNum="+num;
				var loadindex;
				$.ajax({
					url:options.pageUrl,
					type: options.method,
					data:param,
					dataType:"html",
					timeout:5000,  
					beforeSend:function(){
						//请求之前，遮盖层
						layer.ready(function(){
							loadindex = layer.load(0, {shade: false});
						})
		           },
		           complete:function(XMLHttpRequest,status){
		        	   //请求完成，并除去遮盖
		               setTimeout(function(){
		            	   layer.close(loadindex);
		            	   methods.error(status);
		               },200);
		           },
					error:function(XMLHttpRequest, textStatus, errorThrown){
						 methods.error(XMLHttpRequest.status);
					},
		    		success : function(msg){
		    			methods.render(msg);
		    		}
				});
			}
		};
		methods.init();
	};
})(jQuery);












;jQuery.MyNewPage = {    
	//插入HTML
	initHTML:function (options){
		var defaults = {     
				table: '#dataTable', //分页的tableId    
			    page: '#pagination',//分页组件的id
			    pageInfo:"#paginationInfo",//每页显示多少条
			    pageUrl:"",//分页的服务器地址，可以在参数上传或者在分页的组建中传
			    method:"POST",//交互方法
			    form:"#queryForm",//需要提交的form
			    doInit:true,//是否需要初始化查询条件
			    getTable:null,//ajax拼接的table,可以自定义table的样式，也可以使用默认的
			    initback:null,//分页插件初始化完成回掉的方法	
			    initNum:10,//初始化默认每页数量
			  };
		var opts = $.extend(defaults, options);
		if(!(!!opts.pageUrl)){
			opts.pageUrl=$(opts.page).data("url");
		}
		//绑定form的相关事件
		if(!!opts.form){
			$.MyNewPage.bindForm(opts);
		}
		//分页大小
		var sizePage=$(opts.form+" "+opts.pageSize).val();

		if(!!!sizePage){
			sizePage=opts.initNum;
		}
		
		//第一次传一个匿名函数回掉执行，用来初始化分页插件
		$.MyNewPage.insertHTML(opts,1,sizePage,function(conf){
			$.jqPaginator(opts.page, {
				totalPages: conf.totalPages==0?1:conf.totalPages,
				visiblePages: 5,
				currentPage: conf.currentPage,
				wrapper:'<ul></ul>',
				first: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">首页</a></li>',
				prev: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">上一页</a></li>',
				next: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">下一页</a></li>',
				last: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">尾页</a></li>',
				onPageChange: function (num, type) {
					//插入数据
					if(type=="init"){
						//初始化自定义数据
						return;
					} else{
						$.MyNewPage.insertHTML(opts,num,sizePage,null);
					}
				}
			});
		});
	},
	//callback为内部回掉，用于初始化jq分页。禁止外部调用。
	insertHTML:function(options,pageNum,pageSize,callback){
		var param="currentPage="+pageNum+"&pageSize="+pageSize+"&"+$(options.form).serialize();
		var loadindex;
		$.ajax({
			url:options.pageUrl,
			type: options.method,
			data:param,
			dataType:"html",
			timeout:5000,  
			beforeSend:function(){
				layer.ready(function(){
					loadindex = layer.load(0, {shade: false});
				})
               /* var _div = $("<div class='add-style'><img src='"+ctx+"/resources/manage/drybulk/images/loading-1.gif'/>页面正在加载中</div>");
                 _div.appendTo('body');*/
           },
           complete:function(XMLHttpRequest,status){
               setTimeout(function(){
       				layer.close(loadindex);
            	   if(status=='timeout'){//超时,status还有success,error等值的情况
            		   showPageMsg("请求超时，请刷新重试......");
            	   }
               },200);
               
           },
			error:function(XMLHttpRequest, textStatus, errorThrown){
				if(XMLHttpRequest.status==400){
					showPageMsg("您提交的数据异常，服务器拒绝响应......");
				}else if(XMLHttpRequest.status==302){
					showPageMsg("您已掉线，请重新登陆......");
				}else if(XMLHttpRequest.status==405){
					showPageMsg("请求方法错误，请重新配置......");
				}else{
					showPageMsg("加载数据失败，请检查您的网络连接情况......");
				}
			},
    		success : function(msg){
    			$(options.table +" tbody").empty().append(msg);
    			setTimeout(function(){
    				layer.close(loadindex);
    			},	200);
    			var leng="20";//table最大20列
    			if($(options.table+" tbody tr").length<2){
    				var trtd="<tr class='odd'><td colspan='"+leng+"' class='text-center'>当前没有数据</td></tr>";
    				$(options.table+" tbody").append(trtd);
    				//分页信息展示
        			$(options.pageInfo+" #pagenum").text(1);
        			$(options.pageInfo+" #pages").text(1);
        			$(options.pageInfo+" #allsize").text(0)
        			$(options.pageInfo+" #toPage").val(1);
    			}else{
    				//分页信息展示
        			$(options.pageInfo+" #pagenum").text($("#pageInfo").data("pagenum"));
        			$(options.pageInfo+" #pages").text($("#pageInfo").data("pages"));
        			$(options.pageInfo+" #allsize").text($("#pageInfo").data("allsize"))
        			$(options.pageInfo+" #toPage").val($("#pageInfo").data("pagenum"));
    			}
    			if(!!callback){
    				var conf={"totalPages":$(options.table +" #pageInfo").data("pages"),
    						"currentPage":$(options.table +" #pageInfo").data("pagenum")};
    				callback(conf);
    			}
    			if(!!options.initback){
    				options.initback();
    			}
    		}
		});
	},
	//form绑定，tttype决定html分页还是js分页
	bindForm:function(opts){
		if(opts.doInit){
			$(opts.form+" input,"+opts.form+" select").val('');
			$(opts.form+" .selector-txt").html('请选择');
			var text=$(opts.pageInfo+" #pageSize").find("option:selected").text();
			$(opts.pageInfo+" #pageSize").siblings(".selector-txt").text(text);
		}
		//提交功能
		$(opts.form+" #submit").click(function(){
			var pageSize=$(opts.pageInfo+" #pageSize").val();
			if(pageSize<=0||isNaN(pageSize)){
				pageSize=opts.initNum;
			}
			$.MyNewPage.insertHTML(opts,1,pageSize,function(conf){
				$.jqPaginator(opts.page, {
					totalPages: conf.totalPages==0?1:conf.totalPages,
					visiblePages: 5,
					currentPage: conf.currentPage,
					wrapper:'<ul></ul>',
					first: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">首页</a></li>',
					prev: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">上一页</a></li>',
					next: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">下一页</a></li>',
					last: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">尾页</a></li>',
					//page: '<li class="page"><a href="javascript:void(0);">{{page}}</a></li>',
					onPageChange: function (num, type) {
						//插入数据
						if(type=="init"){
							//初始化自定义数据
							return;
						} else{
							opts.param="";
							$.MyNewPage.insertHTML(opts,num,pageSize,null);
						}
					}
				});
			});
		});
		$(opts.form+" input").keyup(function(e){
			if(e.keyCode==13){
				var pageSize=$(opts.pageInfo+" #pageSize").val();
				if(pageSize<=0||isNaN(pageSize)){
					pageSize=opts.initNum;
				}
				$.MyNewPage.insertHTML(opts,1,pageSize,function(conf){
					$.jqPaginator(opts.page, {
						totalPages: conf.totalPages==0?1:conf.totalPages,
						visiblePages: 5,
						currentPage: conf.currentPage,
						wrapper:'<ul></ul>',
						first: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">首页</a></li>',
						prev: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">上一页</a></li>',
						next: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">下一页</a></li>',
						last: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">尾页</a></li>',
						//page: '<li class="page"><a href="javascript:void(0);">{{page}}</a></li>',
						onPageChange: function (num, type) {
							//插入数据
							if(type=="init"){
								//初始化自定义数据
								return;
							} else{
								var pageSize=opts.
								$.MyNewPage.insertHTML(opts,num,pageSize,null);
							}
						}
					});
				});
				return ;
			}
		});
		
		setTimeout(function(){
			$(opts.pageInfo+" #pageSize").css({"text-indent":"0px"});
		},500);
		//每页显示多少条
		$(opts.pageInfo+" #pageSize").change(function(){
			var myPageSize=$(this).val();
			$.MyNewPage.insertHTML(opts,1,myPageSize,function(conf){
				$.jqPaginator(opts.page, {
					totalPages:conf.totalPages==0?1:conf.totalPages,
					visiblePages: 5,
					currentPage: conf.currentPage,
					wrapper:'<ul></ul>',
					first: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">首页</a></li>',
					prev: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">上一页</a></li>',
					next: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">下一页</a></li>',
					last: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">尾页</a></li>',
					onPageChange: function (num, type) {
						//插入数据
						if(type=="init"){
							//初始化自定义数据
							return;
						} else{
							$.MyNewPage.insertHTML(opts,num,myPageSize,null);
						}
					}
				});
			});
		});
		
		//跳转第几页 --点击go
		$(opts.pageInfo+" #goTo").click(function(){
			var pageNum=parseInt($(opts.pageInfo+" #toPage").val());
			if(pageNum<=0||isNaN(pageNum)){
				return ;
			}
			var pageSize=$(opts.pageInfo+" #pageSize").val();
			if(pageSize<=0||isNaN(pageSize)){
				pageSize=10;
			}
			$.MyNewPage.insertHTML(opts,pageNum,pageSize,function(conf){
				$.jqPaginator(opts.page, {
					totalPages: conf.totalPages==0?1:conf.totalPages,
					visiblePages: 5,
					currentPage: conf.currentPage,
					wrapper:'<ul></ul>',
					first: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">首页</a></li>',
					prev: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">上一页</a></li>',
					next: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">下一页</a></li>',
					last: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">尾页</a></li>',
					onPageChange: function (num, type) {
						//插入数据
						if(type=="init"){
							//初始化自定义数据
							return;
						} else{
							$.MyNewPage.insertHTML(opts,num,pageSize,null);
						}
					}
				});
			});
		});
		//跳转第几页 --enter键
		$(opts.pageInfo+" #toPage").keyup(function(e){
			if(e.keyCode==13){
				var pageNum=parseInt($(opts.pageInfo+" #toPage").val());
				if(pageNum<=0||isNaN(pageNum)){
					return ;
				}
				var pageSize=$(opts.pageInfo+" #pageSize").val();
				if(pageSize<=0||isNaN(pageSize)){
					pageSize=10;
				}
				$.MyNewPage.insertHTML(opts,pageNum,pageSize,function(conf){
					$.jqPaginator(opts.page, {
						totalPages: conf.totalPages==0?1:conf.totalPages,
						visiblePages: 5,
						currentPage: conf.currentPage,
						wrapper:'<ul></ul>',
						first: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">首页</a></li>',
						prev: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">上一页</a></li>',
						next: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">下一页</a></li>',
						last: '<li><a href="javascript:void(0);"  class="btn btn-default btn-xs">尾页</a></li>',
						onPageChange: function (num, type) {
							//插入数据
							if(type=="init"){
								//初始化自定义数据
								return;
							} else{
								$.MyNewPage.insertHTML(opts,num,pageSize,null);
							}
						}
					});
				});
			}
		});
		
		//重置功能
		$(opts.form+" #reset").click(function(){
			$(opts.form+" input[type!='hidden'],"+opts.form+" select").val('');
			$(opts.form+" .selector-txt").html('请选择');
			
		});
		//清除功能
		$(opts.form+" .close,"+opts.form+" .close1").click(function(){
			$(this).siblings("input").val('');
		});
	}
};