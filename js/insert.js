require.config({shim:{spine:{deps:["jquery"], exports:"Spine"}}, baseUrl:"js/lib", paths:{app:"../app", models:"../models", sp:"spine"}});
require(["methods", "sp/spine", "app/filter", "app/content"], function() {
  window.App = Spine.Controller.sub({
  el:$("body")
   , elements:{
       "#spotlight":"spotEl", "#modal":"modalEl", "#main form":"mainEl", "#main input":"inputs", "#main .insc":"insc", "#main .select-cart":"isento", "#wrap .mask":"maskEl"
  }, events:{
      "submit #main form":"submit", "click #main .cancel":"getout", "click #main .bconfirm":"cep", "blur #main .cep":"cep", "blur #main .cnpj":"cnpj", "focus #main .combo-input":"prompt", "click #main .bprompt":"prompt", "click #main .combo li":"combo", "click #main .select-cart":"select"
  }, init:function() {
    this.inputs.attr("autocomplete", "off");
    this.doc = $(document);
    this.loading = !1;
    this.doc.on("click", this.proxy(this.anyclick));
    this.modal = new Modal({el:this.modalEl});
    $.getJSON("/library/ajax/location.js", this.proxy(this.source));
    this.maskEl.height(this.stage().h);
    this.el.disableSelection()
  }, submit:function(a) {
    a.preventDefault();
    var b, d, k, e = this, f = [], g = [];
    this.getloading(!0);
    b = this.isento.hasClass("on") ? "x" : " ";
    this.inputs.filter('[name="isento"]').val(b);
    k = this.inputs.filter('[name="cnpj"]').hasClass('error');
    a = arrayObject($(a.target).serializeArray());
    $.each(a, function(a, c) {
      d = !1;
      if("cnpj" === a && k) {
        return e.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "CNPJ inv\u00e1lido!", !0), !1
      }
      if(!c && "ie" === a && "x" === b || c && "ie" === a) {
        if(c && !isNumber(c) && "x" !== b) {
          return e.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", a.capitalize() + " inv\u00e1lido!", !0), !1
        }
        c || (c = " ")
      }else {
        if(!c && "ie" === a && "x" !== b) {
          return e.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "Por favor preecher o campo " + a.capitalize() + ".", !0), !1
        }
      }
      if(c && ("ddd1" === a || "telefone1" === a || "ddd2" === a || "telefone2" === a) && !isNumber(c)) {
        return e.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", a.capitalize() + " inv\u00e1lido!", !0), !1
      }
      if(c || "complemento" === a || "ddd2" === a || "telefone2" === a) {
        c || (c = " ")
      }else{
        return e.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "Por favor preecher o campo " + a.capitalize() + ".", !0), !1
      }
      //"cnpj" === a && (c = onlyNumbers(c));
      if("email" === a && !isEmail(c)) {
        return e.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "E-Mail inv\u00e1lido!", !0), !1
      }
      "senha" === a && (b = c);
      if("csenha" === a && b !== c) {
        return e.modal.open("Erro ao confirmar Senha", "Senha e confirma\u00e7\u00e3o diferentes!", !0), !1
      }
      "none" !== a && "csenha" !== a && (f.push(c), g.push(a + " : " + c));
      d = !0
    });
    d || e.getloading(!1);
    //d && alert(g.join("\n"));
    d && alert(f);
    f = f.join("/");
    d && $.getJSON(nodePath + "Cliente.svc/client/" + f + "/0/?callback=?", this.proxy(function(a) {
      if(-1 !== a.indexOf("salvo")) {
        return e.modal.open("Cadastro enviado com sucesso!", "Obrigado por fazer seu cadastro na Focus T\u00eaxtil. Aguarde contato de um representante Focus para finalizar o seu cadastro e receber seu login e senha.", !1, e.proxy(e.getout)), !1
      }
    }));
    return!1
  }, getloading:function(a) {
    a && !this.loading ? (this.maskEl.fadeIn(), this.loading = !0) : !1 === a && this.loading && (this.maskEl.fadeOut(), this.loading = !1);
    return this.loading
  }, getout:function() {
    window.location = "login.html"
  }, anyclick:function(a) {
    if("object" !== typeof a && a.hasClass("button")) {
      return!1
    }
    a.preventDefault();
    a = $(a.target);
    if(a.hasClass("send")) {
      return this.mainEl.trigger("submit"), !1
    }
    if(!a.parents("label").find(".open").length) {
      return this.el.find(".open").hide().removeClass("open"), !1
    }
  }, prompt:function(a) {
    if("object" === typeof a) {
      a.preventDefault(), a = $(a.target)
    }else {
      return!1
    }
    if(a.hasClass("disable")) {
      return!1
    }
    var b = a.parent().find(".combo");
    if(b.hasClass("open")) {
      return b.hide().removeClass("open"), !1
    }
    a = a.parents("label").find("input");
    b.width(a.width() + 31);
    this.el.find(".open").hide().removeClass("open");
    b.addClass("open");
    b.fadeIn();
    b.tinyscrollbar();
    return!1
  }, source:function(a) {
    var b, d, e = this;
    this.inputs.filter(".combo-input").each(function(f) {
      f = $(this);
      d = f.next("input");
      f = f.parent().find(".combo-list");
      d = d.attr("name").toUpperCase();
      b = a.filter(function(a) {
        return a.INPUT === d
      });
      e.fillbox(b, f)
    });
    return!1
  }, fillbox:function(a, b) {
    for(var d = [], e = 0;e < a.length;e++) {
      d.push('<li data="' + a[e].ID + '">' + a[e].VALUE + "</li>")
    }
    b.html(d.join(""));
    return!1
  }, combo:function(a) {
    if("object" === typeof a) {
      a.preventDefault(), a = $(a.target)
    }else {
      return!1
    }
    var b = a.parents("label").find(".combo");
    a.parents("label").find(".fake-input").val(a.attr("data"));
    a.parents("label").find(".combo-input").val(a.text());
    b.hide();
    b.removeClass("open");
    return!1
  }, getspot:function(a) {
    13 === a.keyCode ? (this.spotlight.close(), this.searchEl.trigger("submit")) : 1 < a.target.value.length ? this.spotlight.open(a) : this.spotlight.close();
    return!1
  }, cep:function(a) {
    "object" === typeof a && (a.preventDefault(), a = $(a.target));
    var b, d = this;
    (b = a.val() || a.prev().val()) && $.getJSON(nodePath + "service=CEP.svc/cep/&query=" + b, function(c) {
      c && c.CLIENT ? c.PAIS = "BR" : (d.modal.open("Campo Inv\u00e1lido", "CEP Digitado n\u00e3o encontrado. Por favor, digite novamente.", !0), d.inputs.filter(".cep").val(""));
      for(var f in c) {
        (b = d.inputs.filter('[name="' + f.toLowerCase() + '"]')) && b.val(c[f].capitalize()), b.hasClass("fake-input") && b.parent().find('[data="' + c[f] + '"]').trigger("click")
      }
      d.el.find(".bprompt").addClass("disable");
      a.blur();
    })
  }, cnpj:function(a) {
    "object" === typeof a && (a.preventDefault(), a = $(a.target));
    var b, d = this;
    b = a.val();
    a.val(onlyNumbers(b));
   if(b && isCnpj(b)){
        a.removeClass('error');
        $.getJSON(nodePath + "Cliente.svc/procurar/" + onlyNumbers(b) + "?callback=?", function(c) {
            if(c.toLowerCase().indexOf('não cadastrado') !== -1)
                return a.blur(), !1;
            if(c.toLowerCase().indexOf('inativo') !== -1)
                return d.modal.open(c.replace('.',''), "Favor entrar em contato com o seu Representante para solicitar acesso ao Focus 24h."), (a.val('').blur()), !1;
            return d.modal.open(c.replace('.',''), " Favor entrar em contato com o seu Representante ou solicitar uma nova senha."), (a.val('').blur()), !1;
        })
    }else if(b){
       (!a.hasClass('error')) && a.addClass('error').blur();
       return !1;
    }
  }, select:function(a) {
    if("object" === typeof a) {
      a.preventDefault(), a = $(a.target)
    }else {
      return!1
    }
    a.hasClass("on") ? this.insc.removeClass("off").attr("readonly", !1) : this.insc.addClass("off").attr("readonly", !0).val(" ");
    a.toggleClass("on")
  }, stage:function() {
    var a, b;
    "number" === typeof window.innerWidth ? (a = window.innerWidth, b = window.innerHeight) : (a = document.documentElement.clientWidth, b = document.documentElement.clientHeight);
    return{w:a, h:b}
  }});
  new App
});