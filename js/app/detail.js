window.Menu = Spine.Controller.sub({
    elements : {
        "li a" : "buttons"
    },
    events : {
        "click a" : "action"
    },
    action : function(a) {
        if ("object" === typeof a)
            a.preventDefault();
        else
            return !1;

        var b = $(a.target).attr("href") ? $(a.target) : $(a.target).parent();
        b = b.attr("href").split("#")[1];
        switch(b) {
            case 'tutorial':
                this.opentutorial();
                break;
            case 'logout':
                this.logout();
                break;
            case 'carrinho':
            case 'order':
                this.opencart(a);
                break;
            default :
                this.opencontact();
        }
        this.close();
    },
    close : function(a) {
        if (a && (a.preventDefault(), a = $(a.target), this.el.find(a).length)) {
            return !1;
        }
        this.el.offset({
            top : 0,
            left : 0
        });
        this.doc.unbind('click');
        this.el.hide();
        return !1;
    },
    open : function(a) {
        this.el.offset({
            top : a.pageY,
            left : a.pageX
        }).show();
        this.doc.unbind('click').bind("click", this.proxy(this.close));
    },
    init : function() {
        this.doc = $(document);
        this.el.disableSelection && this.el.disableSelection();
    }
});
window.Detail = Spine.Controller.sub({
    elements : {
        ".info-top h1" : "title",
        ".info-text dd" : "toplist",
        ".info-box" : "infobox",
        ".info-back" : "infoback",
        ".info-side" : "infoside",
        ".util" : "util",
        ".bicart" : "cartbt",
        ".bicolor" : "colorbt",
        ".birapport" : "rapportbt",
        ".birecepie":"recipiebt",
        ".birecord":"recordbt",
        ".close-bar" : "closebar",
        ".info-list" : "infolist",
        ".color-list" : "colorlist"
    },
    events : {
        "click .bback" : "close",
        "click .close-bar" : "openbar",
        "click .bicart" : "cart",
        "click .bicolor" : "color",
        "click .bimail" : "opencontact",
        "click .birapport" : "rapport",
        "click .disable" : "action",
        "click .color" : "reload"
    },
    close : function(a) {
        if ("object" === typeof a)
            a.preventDefault();
        this.navigate('result', false);
        $("#wrap").removeClass("detail");
        this.on = !1;
        this.el.fadeOut();
        this.setactive();
        $(window).scrollTop(this.scrollp);
        this.infoback.removeClass('blackweek'); //BLACKWEEK
        $("header").show(); //show the bottom part of header
        this.infobox.css({right:-480}); //Return the bar to its initial position
        $("#content").fadeIn(); //Fadein the content of search
        return !1;
    },
    open : function(a) {
        this.item = $.isArray(a) ? a[0] : a;
        //MUDOU
        if(!this.item){
            this.modal.open('Item indisponível!',"O item não está disponível no momento, selecione outro item.", !0);
            return !1;
        }
        this.navigate && this.navigate("detail", this.item.MATNR, !1);
        this.utillist();
        this.getSimilaridade(this.item.MATNR);
        this.size();
        this.rapportlist(this.item.MATNR);
        if(!(-1 !== this.item.SGRUPO.indexOf("Estampado"))){
            this.getcolorlist(this.item.MATNR);
        }
        this.recepieslist(this.item.MATNR);
        this.recordlist(this.item.MATNR);
        this.getBlackWeek(this.item.MATNR); //blackweek
        this.scrollp = $(window).scrollTop();
        this.el.find('.rend').hide();
        window.scroll(0, 0);
        $("#wrap").addClass("detail");
        $("body").addClass("noscroll"); //Remove the scroll of the page
        $("header").hide(); //hide the bottom part of header
        $("#cart").hide(); //MUDOU
        $("#content").fadeOut(); //FadeOut the content of search
        this.getcart(this.proxy(this.status));
        var tp, t,uni, back = "http://189.126.197.169/img/large/large_" + this.item.MATNR + ".jpg";
        if(this.item.UNIDADE_MEDIDA === "MT"){    
          uni="m";
        }
        else{
          uni=this.item.UNIDADE_MEDIDA;
        }
        tp = [this.item.MATNR, this.cmplist(), this.item.GRAMATURA_M + " g/m ", parseFloat(this.item.LARGURA_UTIL) + "m ", parseFloat(this.item.LARGURA_TOTAL) + "m ", this.item.GRUPO, this.item.SGRUPO, this.item.EBOOK_CODE + ' / ' + this.item.EBOOK_PAGE,this.item.UNIDADE_MEDIDA,Math.floor(this.item.PE)+" "+uni, this.item.ETIQUETA, ' ', this.item.ATRIBUTOS.initialCaps(), this.item.CARACTERISTICAS.initialCaps()];
        this.title.text(this.item.MAKTX);
        for (var i = 0; i < this.toplist.length; i++) {
            t = (tp[i] && tp[i] !== " ") ? tp[i] : ' .';
            this.toplist.eq(i).text(t);
        }
        this.infoback.fadeOut(function() {
            //fadeOut the infoback and fadein it with another img init
            var p,q,context=$(this);
              p=new Image, q = back, $(p).load(function() {

                  context.html("<img src='"+back+"'/>").fadeIn("slow");
              }).error(function(){
                  //If don't find the image
                  //context.html("<img src='http://189.126.197.163/focus24h/img/large/large_NONE.jpg' />").fadeIn("slow");
                  context.html("<img src='http://189.126.197.169/img/large/large_NONE.jpg' />").fadeIn("slow");
              }).attr("src", q);
        });
        -1 !== this.item.SGRUPO.indexOf("Estampado") && (this.colorbt.addClass("disable"), this.el.find('.info-color').hide());
        this.on || this.colorbt.removeClass('sel');
        this.el.fadeIn();
    },
    /***** BLACK WEEK CODE ***/
    getBlackWeek:function(code){
        var i;
        $.getJSON("/library/ajax/blackweek.js", this.proxy(function (a) {
            for(i=0;i<a.length;i++){
                if(a[i].MATSKU === code){
                    this.infoback.addClass('blackweek');
                }
            }
        }));
    },
    /***** END BLACK WEEK CODE ***/
    utillist : function() {
        if (this.item.UTILIZACAO === " ")
            return !1;
        $.getJSON(nodePath + "service=SearchMaterial.svc/util/&query" + this.item.UTILIZACAO, this.proxy(function(e) {
            this.util.text(e.capitalize() + '.');
        }));
    },
    getSimilaridade:function(a){
        var obj,i,length,c=[],context=this;
        /*if(" " === this.item.UTILIZACAO) {
          return!1;
        }*/
        //M11ML0049

        $.getJSON("http://189.126.197.169/node/server/briefing.js?service=SearchMaterial.svc/GetSimilaridade/"+a.slice(0, 9)+"?callback=?", this.proxy(function(a) {

        // $.getJSON("http://was-dev/Focus24/Services/SearchMaterial.svc/GetSimilaridade/"+a+"?callback=?", this.proxy(function(a) {
          obj=JSON.parse(a);
          length=obj.length;
          // console.dir(a);
          if(length){
            for(i=0;i<length;i++){
              c.push( "<b>Nome:</b> "+obj[i].MAKTX+" | <b>Código:</b> "+obj[i].MATNR+" | <b>Tipo:</b> "+obj[i].TIPO);
            }
            $(".similar").html("<br/>"+c.join("<br/>"));
          }
          else{
            $(".similar").text("Não tem.");
          }
        }));
    },
    getcolorlist : function(a) {
        var c = [], d = this;
        this.colorbt.addClass("disable");
        a = a.slice(0, -6);
        $.getJSON(nodePath + "service=CorMaterial.svc/get/&query=" + a + "/X?callback=?", function(a) {
            a = a.sortBy("Grupo");
            if (a.length) {
                for (var b = 0; b < a.length; b++) {
                    (-1 === a[b].Desc.indexOf("0")) && c.push("<a href='#" + a[b].Grupo + a[b].Cod + "' class='color'><img src='/library/colors/" + a[b].Cod + ".jpg' width='80' height='80' /><span>" + a[b].Desc.capitalize() + "</span></a>");
                }
                c.length && d.colorbt.removeClass("disable");
                d.colorlist.html("<li>" + c.join("</li><li>") + "</li>").delay(500).fadeIn(function() {
                    d.infoside.tinyscrollbar && d.infoside.tinyscrollbar_update();
                });
                d.el.find('.info-color').show();
            }
        });
    },
    rapportlist : function(c) {
        this.rapportbt.removeClass('sel').addClass("disable");
        this.el.find('.info-rapport').hide();

        $.getJSON("http://189.126.197.169/node/server/briefing.js?service=SearchMaterial.svc/Rapport?callback=?", this.proxy(function(a) {
          var b = a.filter(function(b) {
              return -1 !== b.MATNR.indexOf(c);
          });
          b.length && (this.rapportbt.removeClass("disable"), this.el.find('.info-rapport img').attr('src','http://189.126.197.169/img/rapport/raprt_' + b[0].MATNR + ".jpg"));
        }));
    },
    recepieslist:function(c) {
      this.recipiebt.removeClass('sel').addClass("disable");

      $.getJSON("/library/ajax/lavagem.js", this.proxy(function(a) {
          var b = a.filter(function(b) {
              return -1 !== c.indexOf(b.MATNR);
          });
          b.length && (this.recipiebt.attr("href","/library/jeans/recepies/"+b[0].MATNR+".pdf"),this.recipiebt.removeClass("disable"));
      }));
    },
    recordlist:function(c){
      this.recordbt.removeClass('sel').addClass("disable");

      $.getJSON("/library/ajax/fichas.js", this.proxy(function(a) {
          var b = a.filter(function(b) {
              return -1 !== c.indexOf(b.MATNR); 
          });
          b.length && (this.recordbt.attr("href","/library/jeans/fichas/"+b[0].MATNR+".pdf"),this.recordbt.removeClass("disable"));
      }));

    },
    cmplist : function() {
        var comp = [];
        for (var i = 1; i < 7; i++) {
            if (this.item['CMP' + i])
                comp.push(this.item['PERCENT' + i] + '% ' + this.item['CMP' + i].capitalize());
        }
        return comp.join(", ");
    },
    openbar : function(a) {
        //Action of openbar's div
        if("object" === typeof a) {
            a.preventDefault(), $(a.target);
        }else {
            return!1;
        }
        a=parseInt(this.infobox.css("right")); //Take the right position of infobox

        if(this.el.hasClass("large")){
            //In large resolutions the bar don't close all
                this.infobox.animate({right:-480 === a ? -480 : -480}, 400);
        }
        else{
            //In small resolutions
            this.infobox.animate({right:-480 === a ? -882 : -480}, 400);
        }

        this.colorbt.removeClass("sel");
        this.rapportbt.removeClass("sel");
    },
    color : function(a) {
        if ("object" === typeof a) {
            a.preventDefault(), a = $(a.target);
        } else {
            return !1;
        }
        if (a.hasClass("disable")) {
            return !1;
        }
        var b, d = this, c = [], e;
        this.on = !0;
        b = this.item.MATNR.slice(0, -6);
        d.el.find('.info-rapport').hide();
        d.el.find('.info-color').show();
        d.colorlist.show();
        b=parseInt(this.infobox.css("right"));
        d.infolist.find('.sel').removeClass('sel');
        b !== 0 && a.addClass("sel");
        if(this.el.hasClass("large")){
            this.infobox.animate({right:-480 === b ? 0 : -480}, 400);
        }
        else{
            this.infobox.animate({right:-480 === b ? 0 : -480}, 400);
        }  
        d.infoside.tinyscrollbar && d.infoside.tinyscrollbar_update();
    },
    rapport : function(a) {
        if ("object" === typeof a) {
            a.preventDefault(), a = $(a.target);
        } else {
            return !1;
        }
        if (a.hasClass("disable")) {
            return !1;
        }
        var b, d = this, c = [];
        this.on = !0;
        this.el.find('.info-color').hide();
        this.el.find('.info-rapport').show();
        this.colorbt.removeClass("sel");
        b=parseInt(this.infobox.css("right"));
        this.infobox.find('.info-side').addClass('rapport');
        d.infolist.find('.sel').removeClass('sel');
        b !== 0 && a.addClass("sel");
        if(this.el.hasClass("large")){
            d.infobox.animate({right:-480 === b ? 0 : -480}, 400);
        }
        else{
            d.infobox.animate({right:-480 === b ? 0 : -480}, 400);
        }
    },
    status : function(a) {
        var c = this.item.MATNR;
        var b = (a.length) ? a.filter(function(d) {
            return d.MATNR === c;
        }) : !1;
        (b[0]) ? this.cartbt.addClass('sell') : this.cartbt.removeClass('sell');
    },
    cart : function(a) {
        if ("object" === typeof a)
            a.preventDefault(), a = $(a.target);
        else
            return !1;
        var c, d;
        a.hasClass('sell') ? ( c = 'delete', d = !0, a.removeClass('sell')) : ( c = 'insert', d = !1, a.addClass('sell'));
        this.reloadcart(this.item, c, d);
    },
    action : function(a) {
        a.preventDefault();
        return !1;
    },
    reload : function(a) {
        this.infoback.removeClass('blackweek'); //BLACKWEEK
        if ("object" === typeof a) {
            a.preventDefault(), a = $(a.target), a = a.parent().attr("href").split("#")[1], a = this.item.MATNR.slice(0, -6) + a;
        } else {
            if (!a) {
                return !1;
            }
        }
        $.getJSON(nodePath + "service=SearchMaterial.svc/search/&query=" + a + "/" + this.usr.CNPJ + "/" + this.usr.Email + "?callback=?", this.proxy(this.open));
    },
    size : function() {
        if(this.stage().w>=1195){
            this.el.addClass("large"); //To larg resolutions
        }
      
      //Verify if is ipad and add the class
      var isiPad = navigator.userAgent.match(/iPad/i) != null;
      if(isiPad){
         this.el.addClass("ipad");
      }
      this.infoside.find(".viewport").height("13.2cm");
    },
    init : function() {
        this.item = null;
        this.on = !1;
        this.page = 0;
        this.scrollp = 0;
        this.tutpage = 2;
        this.size();
        this.infoside.tinyscrollbar && this.infoside.tinyscrollbar();
        this.el.disableSelection && this.el.disableSelection();
    }
});