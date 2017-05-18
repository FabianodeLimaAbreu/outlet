require.config({
    shim : {
        spine : {
            deps : ["jquery"],
            exports : "Spine"
        }
    },
    baseUrl : "js/lib",
    paths : {
        app : "../app",
        models : "../models",
        sp : "spine"
    }
});
require("methods sp/min app/filter app/content app/detail app/cart".split(" "), function() {
    window.App = Spine.Controller.sub({
        el : $("body"),
        elements : {
            "#search" : "searchEl",
            "#filter" : "filterEl",
            "#view" : "viewEl",
            "#cart" : "cartEl",
            "#spotlight" : "spotEl",
            "#alt-menu" : "menuEl",
            "#content" : "contentEl",
            "#detail" : "detailEl",
            "#modal" : "modalEl",
            "#wrap .bread-box" : "breadEl",
            "#wrap .user-name" : "userTx",
            "#wrap .user-order" : "orderBt",
            "#wrap .mask" : "maskEl",
            "#wrap .bcart" : "cartBt",
            "#wrap .count" : "countBt",
            ".order-box":"order_box"
        },
        events : {
            "submit #search" : "submit",
            "keyup #search .text" : "getspot",
            "click #wrap .bcart" : "opencart",
            "click #wrap .user-cart" : "opencart",
            "click #wrap .btutorial" : "opentutorial",
            "click .user-help" : "opentutorial",
            "click .user-mail" : "opencontact",
            "click #wrap .user-logout" : "logout",
            "click #wrap .user-order" : "opencart",
            "click #view a" : "changeview",
            "click .order-box a":"sortItems",
            "click .closeie":"closeIe"
        },
        init : function() {
            this.usr = {};
            this.view = "images";
            this.data = [];
            this.fdata = [];
            this.cartlist = [];
            this.loading = !0;
            this.tutpage = 0;
            this.pt = 0;
            this.breadarr = [];  
            this.takedot=!1;      
            this.blackweek=[]; //BLACKWEEK       

            (this.usr = jQuery.parseJSON($.cookie("usr")) || jQuery.parseJSON($.cookie("portal")));
            if (!this.usr || this.usr.TIPO !== "CLIENTE" && this.usr.TIPO !== "GESTOR")
                return this.logout(), !1;
            // console.log(this.usr.TIPO);
            
            // type:this.usr.TIPO;
            // (this.usr.TIPO !== "CLIENTE") ? alert("Nao Cliente") : alert("Cliente");

            // (this.usr = jQuery.parseJSON($.cookie("usr")));
            // if (!this.usr)
            //     return this.logout(), !1;

            /*********Working with update for ie8*********************/
            if($("html").hasClass("ie8") && !$.cookie("ie8")){
              $.cookie("ie8", "Usuário do ie8", {expires:30, path:"/"});
              $("div.modalie").fadeIn("slow");
            }
            this.usr.Nome && this.userTx.text(this.usr.Nome.capitalize());
            this.el.find("#wrap").removeClass("hide");
            this.searchEl.fadeIn().labelOver("over");
            /***** BLACK WEEK CODE ***/
            $.getJSON("/library/ajax/blackweek.js", this.proxy(function(a) {
                this.blackweek = a;
            }));
            /***** END BLACK WEEK CODE ***/
            this.modal = new Modal({
                el : this.modalEl
            });
            this.spotlight = new Spotlight({
                el : this.spotEl
            });
            this.filter = new Filter({
                el : this.filterEl,
                mask : this.maskEl,
                getloading : this.proxy(this.getloading),
                setdata : this.proxy(this.setdata)
            });
            this.detail = new Detail({
                el : this.detailEl,
                usr : this.usr,
                //MUDOU
                modal : this.modal,
                reloadcart : this.proxy(this.reloadcart),
                opencontact : this.proxy(this.opencontact),
                getcart : this.proxy(this.getcart),
                setactive : this.proxy(this.setactive),
                getloading : this.proxy(this.getloading),
                stage : this.proxy(this.stage)
            });
            this.content = new Content({
                el : this.contentEl,
                stage : this.proxy(this.stage)                
            });
            this.menu = new Menu({
                el : this.menuEl,
                opentutorial : this.proxy(this.opentutorial),
                opencontact : this.proxy(this.opencontact),
                logout : this.proxy(this.logout),
                opencart : this.proxy(this.opencart)
            });
            this.cart = new Cart({
                el : this.cartEl,
                mask : this.maskEl,
                usr : this.usr,
                modal : this.modal,
                setactive : this.proxy(this.setactive),
                createbox : this.proxy(this.createbox),
                getloading : this.proxy(this.getloading),
                getcart : this.proxy(this.getcart),
                updatelist : this.proxy(this.updatelist),
                stage : this.proxy(this.stage)
            });
            $(document).on("contextmenu", this.proxy(function(e) {
                e.preventDefault();
                this.menu.open(e);
            }));
            this.getcart();
            this.setactive();
            this.loading = !1;
            var a = 0;
            this.routes({
                "cart" : function() {
                    this.opencart(0, true);
                    this.el.find("#wrap").removeClass("detail");
                },
                "detail/*code" : function(a) {
                    this.detail.reload(a.code);
                    this.setactive(this.detail);
                    this.el.find("#wrap").removeClass("detail");
                },
                "result" : function() {
                    this.el.find("#wrap").removeClass("home");
                    if ("object" === typeof this.active) {
                        var a = this.active.el.attr('id');
                        typeof this[a].close !== 'undefined' && this[a].close();
                    }
                },
                "" : function() {
                    this.el.find("#wrap").removeClass("detail");
                    $("#search").removeClass("search-disabled").find(".text").removeAttr("disabled"); //MUDOU
                    $("#cart").hide();
                    if (!this.loading) {
                        this.reset();
                        this.start();
                    }
                }
            });
        },
        start : function() {
            if (this.loading) {
                return !1;
            }
            this.breadarr = [];
            this.getloading(!0);
            console.log(nodePath + "service=SearchMaterial.svc/outlet/&query=x?callback=?");
            $.getJSON(nodePath + "service=SearchMaterial.svc/outlet/&query=x?callback=?", this.proxy(this.setdata)).fail(function() {
                console.log("second success");
            }).fail(function() {
                console.log("error");
            }).always(function() {
                console.log("complete");
            });
            this.breadEl.find(".bread-search").hide();
            return !1;
        },
        reset : function(a) {
            this.breadEl.hide();
            this.maskEl.fadeOut();
            this.filterEl.fadeOut();
            this.content.reset();
            this.searchEl.find(".text").val("").blur();
            this.data = [];
            this.fdata = [];
            if ("object" === typeof this.active) {
                var a = this.active.el.attr('id');
                typeof this[a].close !== 'undefined' && this[a].close();
            }
        },
        submit : function(a) {
            a.preventDefault();
            a = arrayObject($(a.target).serializeArray());
            a=a.search;
            if (this.loading || !a) {
                return !1;
            }
            this.breadarr = [];
            if(-1 !== a.removeAccents().capitalize().indexOf(",") || -1 !== a.removeAccents().capitalize().indexOf(".")){
              //Caso tenha , na busca
              if(-1 !== a.removeAccents().capitalize().indexOf("Veludo")){
                //Caso seja veludo
                var str=a.removeAccents().capitalize();
                a=str.substr(0,str.indexOf(' ')); //Pega a primeira palavra antes do espaço para poder fazer a busca e depois filtrar pelo atributo
                this.breadarr.push(str); //Escreve o breadcrumb com a palavra da busca inteira
                this.takedot=str.substr((a.length)+1,str.indexOf(' ')); //Passa para um atributo da classe, a palavra apos o espaço
              }
            }
            else{
              //Caso não tenha , na busca
              this.breadarr.push(a);
              this.takedot=!1;
            }
            b = a.removeAccents().capitalize().replace(/\s/g, '');
            
            this.breadEl.find(".bread-search").show();
            $.getJSON(nodePath + "service=SearchMaterial.svc/searchOutlet/&query=" + a.removeAccents().initialCaps().replace(" de "," ") + "/" + this.usr.CNPJ + "/" + this.usr.Email + "?callback=?", this.proxy(this.setdata)).done(function() {
                console.log("second success");
            }).fail(function() {
                console.log("error");
            }).always(function() {
                console.log("complete");
            });
            this.el.find("#wrap").removeClass("home");
            this.getloading(!0);
            return !1;
        },
        getspot : function(a) {
            if (a.keyCode === 13) {
                this.spotlight.close(), this.searchEl.trigger('submit');
            } else {
                this.filter.close();
                (a.target.value.length > 1) ? this.spotlight.open(a) : this.spotlight.close();
            }
            return !1;
        },
        opentutorial : function(a) {
            if ("object" === typeof a) {
                a.preventDefault(), a = $(a.target);
            }
            var b = (this.active === this.content) ? this.tutpage : this.active.tutpage;
            this.modal.tutorial(b);
            return !1;
        },
        opencontact : function(a) {
            if ("object" === typeof a) {
                a.preventDefault(), a = $(a.target);
            }
            this.modal.contact();
            return !1;
        },
        setactive : function(a) {
            this.active = a || this.content;
            a && this.active.tbody && (this.el.addClass("noscroll"), this.scroll(this.active.tbody), this.maskEl.addClass("otop").height(this.stage().h - 356), window.scroll(0, 0));
            a && !this.active.body && $(window).unbind('scroll'), window.scroll(0, 0);
            this.pt = 0;
            a || (this.updatelist(), this.el.removeClass("noscroll"), this.scroll(), this.maskEl.removeClass("otop").height(this.stage().h - 206));
        },
        getloading : function(a) {
            a && !this.loading ? (this.maskEl.fadeIn(), this.loading = !0) : !1 === a && this.loading && (this.maskEl.fadeOut(), this.loading = !1);
            return this.loading;
        },
        setdata : function(a, b) {
            if(this.takedot){
              if(-1 !== this.takedot.indexOf(".")){
                this.takedot=this.takedot.replace(".",",");
              }
              this.takedot=this.takedot.replace("Ca","");
              //Caso tenha ponto na busca, ao invez de filtrar pelo MAKTX, filtra pelo ATRIBUTO
              this.fdata = filterBy(a,'ATRIBUTOS',this.takedot).sortBy("MAKTX").unique();
              this.fdata=this.filterBySearch(this.fdata);
            }
            else{
              this.fdata = a.sortBy("MAKTX").unique();
              this.fdata=this.filterBySearch(this.fdata);
            }
            this.content.page = 0;
            this.tutpage = 1;
            this.breadarr = (this.searchEl.find('.text').val()) ? this.breadarr.slice(0, 1) : [];
            //this.el.animate({scrollTop:0}, "slow");
            this.breadEl.find(".bread-total").text(0);
            this.breadEl.find(".bread-page").text(0);
            b ? (this.filter.list = [], this.data = this.fdata || this.data) : this.filter.list.length || (this.fdata = this.data);
            if (!this.fdata.length) {
                return this.modal.open("Tente novamente", "Nenhum resultado encontrado para busca.", !0), this.getloading(!1), this.breadEl.find(".bread-search span").text(""), this.filter.list = [], this.active.itens.remove(), !1;
            }
            if (this.filter.list.length) {
                for ( a = 0; a < this.filter.list.length; a++) {
                    this.breadarr.push(" " + this.filter.list[a].ft);
                }
            }
            this.content.changeview(this.view);
            b || this.breadEl.find(".bread-search").show();
            b && this.filter.checklist(this.data);
            this.content.itemlist = [];
            this.createbox(this.fdata, this.content.page, !0);
            ("images" !== this.view) ? (this.content.table.show(), this.scroll(this.content.tbody)) : this.scroll();
        },
        filterBySearch:function(data){
            var ocorrence=[],num=[];
            /*The lines below work like a new feature implemented in April,2 2015. Before this feature
            all search's result was written in alfabetic ordem without any param, now All search's result
            is written in alfabetic ordem, but before this, the preference is for items that it's description match with
            the value of search's input.*/

            for(var i=0;i<data.length;i++){
                if(data[i].MAKTX.indexOf(this.breadarr.slice(0, 1).toString().toUpperCase().replace("  "," ")) === 0){
                    //Passing all positions of result compare search's value with object name
                    ocorrence.push(data[i]);
                    //console.log(i+" * "+data[i].MATNR+" , "+data[i].MAKTX);
                    num.push(data[i].MATNR); //Save the position of this ocorrence to splice array after all
                }
            }  
            var i=0;
            while(i< num.length){
                //Pass into array of positions to data
                for(j=0;j<data.length;j++){
                    if(data[j].MATNR === num[i]){
                        //Passing in data json also, and comparing with the position number saver previously
                        //If it match, remove this item from data array
                        data.splice(j,1);
                    }
                }
                i++;
            }
            ocorrence= ocorrence.sortBy("MAKTX").unique();
            return ocorrence.concat(data);
        },
        createbox : function(a, b, d, c) {
            var f, m, g, n, v;
            c = c || this.view;
            n = "images" === c ? "div" : "tr";
            this.loading = !0;
            this.maskEl.fadeIn().find(".loader").show();
            this.active = this.active || this.content;
            d = this.active.itens && !d ? this.active.itens.length : 0;
            m = 24 * (b + 1) < a.length ? 24 * (b + 1) : a.length;
            var p, h, q, k = 24 * b, l = m - k, e = this;
            if (d < a.length && a[k]) {
                f = setInterval(function() {
                    h = a[k];
                    if (!h) {
                        clearInterval(f);
                        e.endloading();
                        return !1;
                    }
                    if ("images" === c && l > 0) {
                        if (h && v === h.MATNR)
                            return !1;
                        v = h.MATNR || null;
                        p = new Image, q = "http://189.126.197.169/img/small/small_" + h.MATNR + ".jpg", $(p).load(function() {
                            if (!l > 0)
                                return !1;
                            g = new Box({
                                item : h,
                                view : c,
                                tag : n,
                                reloadcart : e.proxy(e.reloadcart),
                                detail : e.detail,
                                url : this,
                                blackweek:e.blackweek //BLACKWEEK
                            });
                            e.active.create(g.render());
                            l--;
                            k++;
                        }).error(function() {
                            if (!l > 0)
                                return !1;
                            var a = new Image;
                            //console.log('Sem imagem: *' + h.MATNR + " " + h.MAKTX + " " + h.GRUPO + " " + h.SGRUPO);
                            //a.src = "http://189.126.197.163/focus24h/img/small/small_P21NL0055307414.jpg"; - ALTERADO 19/08 - Imagem Errada
                            a.src = "http://189.126.197.169/img/small/small_NONE.jpg";
                            g = new Box({
                                item : h,
                                view : c,
                                tag : n,
                                reloadcart : e.proxy(e.reloadcart),
                                detail : e.detail,
                                url : a,
                                blackweek:e.blackweek //BLACKWEEK
                            });
                            e.active.create(g.render());
                            l--;
                            k++;
                        }).attr("src", q);
                    } else {
                        if (l > 0) {
                            return g = new Box({
                                item : h,
                                view : c,
                                tag : n,
                                reloadcart : e.proxy(e.reloadcart),
                                detail : e.detail,
                                modal : e.modal,
                                blackweek:e.blackweek //BLACKWEEK
                            }), e.active.create(g.render()), l--, k++, !1
                        } else {
                            clearInterval(f), e.endloading();
                        }
                    }
                }, 100);
            } else {
                return this.endloading(), !1
            }
            (this.active === this.content) && (this.breadEl.find(".bread-total").text(a.length), this.breadEl.find(".bread-page").text(m || 1), this.breadEl.find(".bread-search span").text(this.breadarr.join(" > ").capitalize()));
            this.breadEl.fadeIn()
        },
        endloading : function(a) {
            a && clearInterval(a);
            var b = this;
            b.active.tbody.find("tr").removeClass('odd').filter(":odd").addClass("odd");
            b.active.tbody.find("input").parent().addClass("ajust")
            b.active.itens.fadeIn(function() {
                b.getloading(!1);
            });
            //b.active.tbody.scrollTop(b.pt);
            if (this.active === this.content)
                this.updatelist(), this.active.tbody.height(this.stage().h - 312);
        },
        updatelist : function(a) {
            var b, d, c;
            d = this.content ? this.content.itemlist : [];
            if (!d.length)
                return !1
            if (a) {
                a = $.isArray(a) ? a : [a], c = a.pop(), c = c.MATNR || c.item.MATNR, b = d.filter(function(a) {
                    return a.item.MATNR === c
                });
                b[0] && b[0].button.hasClass("remove-cart") && b[0].change(), a.length && this.updatelist(a);
                return !1;
            }
            this.cartlist.length && this.cartlist.forEach(function(k) {
                b = d.filter(function(b) {
                    return b.item.MATNR === k.MATNR
                });
                b[0] && !b[0].button.hasClass("remove-cart") && b[0].change()
            })
        },
        reloadcart : function(a, b, d) {
            var c;
            c = a.QUANTIDADE || a.MEDIA_PECA;
            c = [this.usr.CNPJ, a.MATNR, a.MAKTX.replace(/[/]/g, "-").replace('%', '_'), a.MEDIA_PECA, c];
            console.log(b + " " + c + " " + d);
            //this.endloading();
            d && this.updatelist(a);
            "delete" === b && ( c = c.slice(0, 2));
            $.getJSON(nodePath + "service=Cart.svc/" + b + "/&query=" + c.join("/") + "?callback=?", this.proxy(this.getcart)); 
        },
        getcart : function(a, c) {
            c && a && this.cartlist && "function" === typeof a && a(this.cartlist);
            $.getJSON(nodePath + "service=Cart.svc/get/&query=" + this.usr.CNPJ + "?callback=?", this.proxy(function(b) {
                this.cartlist = b;
                this.countBt.text(b.length);
                b.length ? (this.countBt.removeClass("disable"), this.cartBt.removeClass("disable")) : (this.countBt.addClass("disable"), this.cartBt.addClass("disable"));
                a && "function" === typeof a && a(b)
            }))
        },
        opencart : function(a) {
            if ("object" === typeof a) {
                a.preventDefault(), a = $(a.target)
            } else {
                return !1
            }
            if (this.loading)
                return !1
            if (this.active === this.detail)
                this.active.close();
            this.el.find("#wrap").removeClass("home");
            this.loading || a.attr("href") === this.cartBt.attr("href") ? (this.loading || this.cartBt.hasClass("disable") || this.setactive(this.cart), this.cart.open()) : (this.setactive(this.cart), this.cart.open(1))
        },
        changeview : function(a) {
            if ("object" === typeof a) {
                a.preventDefault(), a = $(a.target)
            } else {
                return !1
            }
            if (this.loading) {
                return !1;
            }
            a.hasClass("sel") || (this.viewEl.find("a").removeClass("sel").addClass("unsel"), a.addClass("sel").removeClass("unsel"), this.view = a.attr("href").split("#")[1], this.order_box.find("a").removeClass("sel"),this.order_box.find(".orderb").html("Ordenar Por:<span class='icon open-left notradius'></span>"),this.order_box.find("ul ul a").addClass("unsel"),this.setdata(this.fdata));
        },
        logout : function(a) {
            a && a.preventDefault();
            this.usr && $.cookie("usr", null, {
                path : "/"
            });
            window.location.href = "login.html";
        },
        sortItems:function(a){
            a && a.preventDefault();
            var type,i,length,temp=[];
            if($(a.target).hasClass("sel") || $(a.target).hasClass("orderb") || this.loading){
              return !1;
            }
            type=$(a.target).attr("href").replace("#","");
            this.content.reset();
            this.order_box.find("a").removeClass("sel").addClass("unsel");
            this.order_box.find(".orderb").removeClass("unsel").addClass("sel").html($(a.target).attr("title")+"<span class='icon open-left notradius'></span>");
            this.order_box.find("."+type).removeClass("unsel").addClass("sel");
            if(type !== "bigPE"){
                length= this.fdata.length;
                if(type !== "PE"){
                    for(i=0;i<length;i++){
                        this.fdata[i][type]=this.fdata[i][type].replace("  "," "); //Validating when article has doble space insert in SAP
                    }
                }
                temp = this.fdata.sortBy(type).unique();
                this.createbox(temp, this.content.page);
            }
            else{
              temp = this.fdata.sortBy("PE").unique();
              length=this.fdata.length-1;
              for(i=length;i>=0;i--){
                temp.push(this.fdata[i]);
              }
              this.createbox(temp.unique(), this.content.page);
            }
            "images" !== this.view ? (this.content.table.show(), this.scroll(this.content.tbody)) : this.scroll();
        },
        stage : function() {
            var a, b;
            "number" === typeof window.innerWidth ? ( a = window.innerWidth, b = window.innerHeight) : ( a = document.documentElement.clientWidth, b = document.documentElement.clientHeight);
            return {
                w : a,
                h : b
            }
        },
        closeIe:function(event){
            event.preventDefault();
            $("div.modaldefault").fadeOut("slow");
        },
        scroll : function(z) {
            var a, b, d, c, f = this;
            z = z || $(window);
            $.hasData(z[0]) && z.unbind('scroll');
            if (!f.active.itens) {
                return !1;
            }
            z.scroll(function() {
                f.modal.close();
                b = z.scrollTop();
                d = ('list' === f.view || f.active !== f.content) ? f.active.itens.length * 40 : $(document).height();
                c = z.height();
                a = (f.active === f.content) ? Math.ceil(f.fdata.length / 24) : Math.ceil(f.active.data.length / 24);
                0.95 < b / (d - c) && (!f.loading && f.active.page < a && (f.active.page++, f.pt = b, (f.active === f.content) ? f.createbox(f.fdata, f.active.page) : f.createbox(f.active.data, f.active.page, !0, "list")));
            });
        }
    });
    new App;
    Spine.Route.setup();
}); 