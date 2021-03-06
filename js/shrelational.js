(function(){
	'use strict'
	var selectTreeSelector = ".selectTree", 
	get = {
		// selectors tree dom - get.item/all("seletor",fatherDom) 
	 	item: function(el, root){
			if(typeof(root)!="undefined") return root.querySelector(el);
			return document.querySelector(el);
	 	},
	 	all: function(el, root){
	 		if(typeof(root)!="undefined") return root.querySelectorAll(el);
	 		return document.querySelectorAll(el);
	 	},
		searchKey: function(arr, key, value){
			for (var i = arr.length; i--;) {
				if(arr[i][key]==value) return i;
			};
			return null;
		}
	},
	selectTree = (function(el){
		var app = {
			active: false,
			list: [],
			fathers: [],
			el: {},
			value: null,
			empty: "Sem itens para os pai(s) selecionados", // DEFAULT MESSAGE EMPTY
			beforeOptions: "", //DEFAULT AFTER OPTION
			_getValueFather: function(key){
				var temp = get.item('select[data-shr-id="'+key+'"]'),
				val;
				if(temp===null) {
					throw "SelectTree: Father ("+key+") not found";
				}
				val = temp.value;
				app.fathers.push({'id': key,'value': val,'el': temp});
			},
			_updateValueFather: function(){
				var fathers = app.fathers;
				app.fathers = [];
				for (var i = fathers.length; i--;) {
					app._getValueFather(fathers[i].id);
				}
			},
			_filter: function(option){
				for (var i = app.fathers.length; i--;) {
					if(app.fathers[i].value!="all"){
						if(typeof(option[app.fathers[i].id])==="undefined") return false;
						// CONFERIR LANCE DE COMPRAÇÂO DE STRING COM NUMBER DO INDEX OF
						if(option[app.fathers[i].id].indexOf(app.fathers[i].value)===-1) return false; 
					}
				}
				return true;
			},
			buildOptions: function(){
				var string = "";
				for (var i = app.list.length; i--;) {
					if(app._filter(app.list[i])) 
						string = app.list[i].html + string;
				};
				string = app.beforeOptions.html + string;
				if(string==="") 
					string = '<option disabled="on" value="" selected="on">'+app.empty+'</option>';
				app.el.innerHTML = string;
			},
			statusSelect: function(){
				var dataset = app.el.dataset;
				if(dataset.shrValue){
					app.value = dataset['shrValue'];
					delete dataset['shrValue'];
				} 
				if(dataset.shrEmpty) app.empty = dataset.shrEmpty;
			},
			setEvents: function(){
				var flag = true;
				for (var i = app.fathers.length; i--;) {
					app.fathers[i].el.addEventListener('change',function(){
						app._updateValueFather();
						app.buildOptions();
					},false);
					app.fathers[i].el.addEventListener('DOMSubtreeModified',function(){
						//EVENTO @DOMSubtreeModified É DISPARADO DUAS VEZES
						//FLAG e SeTimeout PARA NÃO EXECUTAR DUAS VEZES
						if(flag){ 
							flag = false;
							setTimeout(function(){
								app._updateValueFather();
								app.buildOptions();
								flag = true;	
							},100);
						}
					},false);
				}
			},
			list: function(select){
				var elOptions = get.all("option",select),
				list = [],
				dataset = {},
				valueCheck = [],
				listTemp,
				val = 0,
				keySearch;
				for (var i = 0, lim = elOptions.length; i<lim; i++) {
					val = elOptions[i].value
					listTemp = {'value': val};
					
					keySearch = null;
					if(valueCheck.indexOf(val)!==-1) {
						keySearch = get.searchKey(list, 'value', val);
					}
					valueCheck.push(elOptions[i].value);
					if(keySearch!==null) listTemp = list[keySearch]

					//PERCORRER OBJETO DATASET
					dataset = elOptions[i].dataset;
					for (var key in dataset) if(dataset.hasOwnProperty(key)) {
						// IF HAVE DATA OF SELECTTREE - @data-cod | @dataCod
						if(key.indexOf("Cod")!=-1){
							if(keySearch!==null && key in listTemp) {
								listTemp[key] = listTemp[key].concat(dataset[key].split(","));
							} else {
								listTemp[key] = dataset[key].split(",");
							}
							delete dataset[key];
							if(!app.active) app.active = true;
							if(get.searchKey(app.fathers,'id',key)===null)
								app._getValueFather(key);
						}
					}

					// SETA VALUE DEFAULT
					if(val==app.value) elOptions[i].setAttribute('selected','on');
					if(elOptions[i].hasAttribute('selected')){
						if(app.value==null) app.value = val;
						if(app.value!=val) elOptions[i].removeAttribute('selected');
					} 
					listTemp.html = elOptions[i].outerHTML;

					if(val === "all"){
						app.beforeOptions = listTemp;
					} else {
						if(keySearch===null){
							list.push(listTemp);
						} else {
							list[keySearch] = listTemp;
						}
					}
				};
				return list;
			}
		}
		app.el = el;
		app.statusSelect();
		app.list = app.list(el); //FOR CLEAN FUNCTION LIST WITH ARRAY LIST - CLEAN MEMORY
		app.buildOptions();
		if(!app.active) return 0;	
		app.setEvents();
		console.dir(app);
	});
	var el = get.all(selectTreeSelector);
	for (var i = el.length - 1; i >= 0; i--) {
		selectTree(el[i]);
	};
}());