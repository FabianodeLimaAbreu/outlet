require.config({shim:{spine:{deps:["jquery"], exports:"Spine"}}, baseUrl:"js/lib", paths:{app:"../app", models:"../models", sp:"spine"}});
require(["methods", "sp/spine", "app/content"], function() {
  window.App = Spine.Controller.sub({
  el:$("body")
   , elements:{
       "#modal":"modalEl", "#login":"loginEl", "#login input":"inputs", "#login .title":"title"
  }, events:{
      "submit #login form":"submit", "click #login .back":"getout", "click #login .collumn-box a":"action"
  }, init:function() {
    this.hash = window.location.hash.split('#')[1];
    this.url = nodePath + "service=Login.svc/client/";
    this.inputs.attr("autocomplete", "off");
    this.loading = !1;
    this.modal = new Modal({el:this.modalEl});
    
    if(this.usr)
      window.location.href = './';

    this.loginEl.fadeIn();

    /*$.getJSON("http://189.126.197.163/node/start/index.js", function(a) {               
    }));*/
  }, submit:function(a) {
    a.preventDefault();
    var b, f = [], g, e = this;
    //k = this.inputs.filter('[name="cnpj"]').hasClass('error');
    k = this.loginEl.hasClass('admin');
    k && (this.url = nodePath + "Login.svc/sap/");
    g = this.loginEl.attr('class');
    a = arrayObject($(a.target).serializeArray());
    $.each(a, function(a, c) {
      b = !1;
      if("cnpj" === a && !k) {
        if(!c || !isCnpj(c))
            return e.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "CNPJ inv\u00e1lido!", !0), !1;
        else
           c = onlyNumbers(c); 
      }
      if("login" === a  && !k && !isEmail(c)) {
        return e.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "E-Mail inv\u00e1lido!", !0), !1;
      }
      if("password" === a && !c) {
         return e.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "Senha inv\u00e1lida!", !0), !1;
      }
      f.push(c);
      b = !0;
    });
    f = f.join("/");
    b && $.getJSON(this.url +"&query="+ f + "?callback=?", this.proxy(function(a) {
      console.log("Ok");
        if(!k && a.CNPJ){
            $.cookie.json = true;
            $.cookie('usr',a,{path:'/'});
            window.location.href='./';
            return !1;
        }
        if(k && a.LOGIN){
           $.cookie.json = true;
           $.cookie('admin',a,{path:'/'});
           window.location.href='./admin.html';
           return !1;
        }
        if(g)
            return e.modal.open("Mensagem enviada!", a, !1, e.proxy(e.getout)), !1;
         
         a = a.Mensagem || a;
         return e.modal.open("Erro", a, !0, e.proxy(e.getout)), !1;
    }));
    return!1
  }, action:function(a) {
    a && a.preventDefault(), a = $(a.target);
    var c, b = a.attr('href').split('#')[1];
    this.title.text(a.text());
    this.loginEl.addClass(b);
    this.url = nodePath + "service=Login.svc/senha/";
    this.inputs.filter('[name="password"]').attr('disabled','disabled');
  }, getout:function() {
    window.location = "login.html"
  }});
  new App;
});

