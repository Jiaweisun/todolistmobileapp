function pd(func) {
	return function(event) {
		event.preventDefault();
		func && func(event);
	};
};
var itemValue={
	text:"",
	description:","
	
};
document.ontouchmove = pd();
var app = {
	view : {},
	model : {}
};
var bb = {
	view : {},
	model : {}
};

var  url_str="http://ec2-54-73-126-198.eu-west-1.compute.amazonaws.com"

var browser = {
	android : /Android/.test(navigator.userAgent)
};
browser.iphone = !browser.android;

var scrollContent;

bb.init = function() {
	//iscroll
	scrollContent = {
		scroll : function() {
			var self = this;
			setTimeout(function() {
				if (self.scroller) {
					self.scroller.refresh();
				} else {
					self.scroller = new iScroll($("div[data-role='content']")[0]);
				}
			}, 1);
		}
	};

	//model
	bb.model.Item = Backbone.Model.extend(_.extend({
		defaults : {
			text: '',
			description : "",
			id : new Date().getTime()
		},
		urlRoot: url_str+'/api/rest/todo',
		initialize : function() {
			var self = this;
			_.bindAll(self);
		}
	}));

	bb.model.Items = Backbone.Collection.extend(_.extend({
		model : bb.model.Item,
		//localStorage : new Store("items"),
		url :url_str+ '/api/rest/todo',
		/*initialize : function() {
			var self = this;
			_.bindAll(self);
			self.count = 0;
			self.on('reset', function() {
				self.count = self.length;
			});
		},*/
		additem : function(text) {
			var self = this;
		self.count=0;
		self.count=self.length;
			var item = new bb.model.Item({
				text : text,
				description : "" + 'item' + self.count,
				id : new Date().getTime()
			});
			self.add(item);
			self.count++;
			console.log("add action:"+item);
			item.save();

		//	urlRoot : url_str+'/api/rest/todo';
		}
	}));

	bb.model.State = Backbone.Model.extend(_.extend({
		defaults : {
			items : 'loading'
		},
	}));

	//views
	bb.view.Head = Backbone.View.extend(_.extend({
		events : {
			'tap #add' : function() {
				
				var self = this;
				var input_box=$("#input_text");
				var input_box_parent=input_box.parent();
				input_box_parent.show();
				input_box.unbind("keypress");
				input_box.bind("keypress",function(e){
					if(e.which==13)
					{
						//self.items.additem();
						var text=$(this).val();
						if(text.length>0){
							self.items.additem(text);
							$(this).val("");
							input_box_parent.hide();
						}
						else{
							input_box_parent.hide();
						}
					}
					else if(e.which==0 || e.which==27)
					{
						input_box_parent.hide();
					}
					console.log(e.which);
				});
				
			}
		},
		initialize : function(items) {
			var self = this;
			_.bindAll(self);
			self.setElement("div[id='main_header']");
			$("#input_text").parent().hide();
			self.items = items;
			self.elements = {
				title : self.$el.find('h1'),
				add : self.$el.find('#add')
			};

			self.tm = {
				heading : _.template(self.$el.html())
			};

			//self.elements.add.hide();
	
			app.model.state.on('change:items', self.render);
			self.items.on('add', self.render);
		},
		render : function() {
			var self = this;
			var loaded = 'loaded' == app.model.state.get('items');
			var t={
				title : loaded ? self.items.length + 'Items' : 'Loading...'
			};
			self.elements.title.text(t.title);
			if (loaded) {
				//self.elements.add.show();
			}
		}
	}));

	bb.view.List = Backbone.View.extend(_.extend({
		events : {
			"tap a.del_item" : function(e) {
				console.log(e.currentTarget);
				var self = this;
				var itemid = $(e.currentTarget).parent().parent().parent("li").attr("id");
				var item = self.items.get(itemid);
				//item.destroy(item);
				item.destroy();
				$(e.currentTarget).parent().parent().parent("li").remove();
				 scrollContent.scroll();
				 e.stopPropagation();

			},
			"tap a.edit_item" : "edit_item",
			"tap span.check":function (e){

				console.log($(e.currentTarget));
				var text=$(e.currentTarget).text();
				var del=$(e.currentTarget).parent().find("a.del_item");
				var edit=$(e.currentTarget).parent().find("a.edit_item");
				if(text!=="x")
				{
					$(e.currentTarget).text("x");
					del.css("display","");
					edit.css("display","");
				}
				else{
					$(e.currentTarget).text("");
					del.css("display","none");
					edit.css("display","none");
				}
				e.stopPropagation();

				
		},
			"tap .ui-controlgroup":function (e){
				var text=$(e.currentTarget).find(".text").text();
				var description=$(e.currentTarget).find(".description").text();
				console.log(text+"->"+description);
				itemValue.text=text;
				itemValue.description=description;
				$.mobile.changePage( "#lists", { transition: "slide" });

			},
			"click  input.check_box":"check_box"
		},

		initialize : function(items) {
			var self = this;
			_.bindAll(self);
			self.setElement('#list');
			self.tm = {
				item : _.template(self.$el.html())
			};
			self.items = items;
			self.items.on('add', self.appenditem);
		},
		render : function() {
			var self = this;
			self.$el.empty();
			self.items.each(function(item) {
				self.appenditem(item);
			});
			self.input = self.$('.edit');
			console.log(self.input);
		},
		appenditem : function(item) {
			var self = this;
			var itemview = new bb.view.Item({
				model : item
			});

			//itemview.$el.click(function(){console.log(this);})
			//console.log(itemview.$el.html());
			//itemview.$el.find("#input_box").textinput();
			self.$el.append(itemview.$el.html());
	
			$("#list").listview('refresh');
			self.scroll();

		},
		check_box:function (e){

				console.log($(e.currentTarget));
				var del=$(e.currentTarget).parent().find("a.del_item");
				var edit=$(e.currentTarget).parent().find("a.edit_item");
				if($(e.currentTarget).is(':checked'))
				{
					del.css("display","");
					edit.css("display","");
				}
				else{
					del.css("display","none");
					edit.css("display","none");
				}
				e.stopPropagation();

				
		},
		delitem:function(id)
		{
		var self=this;
		var item=self.items.get(id);
		self.items.remove(item)
		},
		edit_item:function(e) {
				console.log(e.currentTarget);
				var self = this;
				var currentTarget=$(e.currentTarget);
				var itemid = currentTarget.parent().parent().parent("li").attr("id");
				var item = self.items.get(itemid);
				var text=currentTarget.parent().find("span.text").text();
				var input_box=$("#input_text");
				input_box.val(text);
				var input_box_parent=input_box.parent();
				input_box_parent.show();
				input_box.unbind("keypress");
				input_box.bind("keypress",function(e){
					if(e.which==13)
					{
						

						var text = $(this).val();
						if (text.length > 0) {
							self.items.additem(text);
							$(this).val("");
							input_box_parent.hide();

							item.destroy(item);
							currentTarget.parent().parent().parent("li").remove();
							scrollContent.scroll();
						}
						else{
							input_box_parent.hide();
						}


					}
					else if(e.which==0 || e.which==27)
					{
						input_box_parent.hide();
					}
					console.log(e.which);
				});
				
				
				 e.stopPropagation();

			}
	}, scrollContent));

	bb.view.Item = Backbone.View.extend(_.extend({
		//el:$("content.newitem"),
		events : {
			"click div" : function() {
				console.log("del");
			}
		},

		initialize : function() {
			var self = this;
			_.bindAll(self);
			self.elements = {
				edit : self.$el.find('div a.edit_btn'),
				del : self.$el.find('div a.del_btn')
			};

			//self.input=self.$("#new-text");
			console.log(self);
			self.render();
		},
		render : function() {
			var self = this;
			var html = self.tm.item(self.model.toJSON());

			self.$el.append(html);
			self.$el.children().find("div").controlgroup();
			self.$el.children().find("a.del_btn").buttonMarkup();
			self.$el.children().find("a.edit_btn").buttonMarkup();

		},
		freshButton : function() {
			var self = this;
			console.log("self.$el");

			console.log(self.$el);

		}
	}, {
		tm : {
			item : _.template($('#item-template').html())
		}
	}));

};
//app for management
app.init_browser = function() {
	if (browser.android) {
		$("#main div[data-role='content']").css({
			bottom : 0
		});
	}
};

//app for management
app.init = function() {
	console.log('start init');
	bb.init();
	app.init_browser();
	app.model.items = new bb.model.Items();
	app.model.state = new bb.model.State();
	app.view.list = new bb.view.List(app.model.items);
	app.model.items.fetch({
		success : function() {
		//	app.view.list = new bb.view.List(app.model.items);
			 setTimeout(function() {
			 	app.model.state.set({
					items : 'loaded'
				});
				app.view.list.render();
			}, 0);
		},
		error : function(data) {
			console.log(data+'connection failure');
		}
	});
	app.view.Head = new bb.view.Head(app.model.items);
	//app.view.list.render()

	console.log('end init');
};

//regular expression
_.templateSettings = {
	interpolate : /\{\{(.+?)\}\}/g,
	escape : /\{\{-(.+?)\}\}/g,
	evaluate : /\{\{=(.+?)\}\}/g
};