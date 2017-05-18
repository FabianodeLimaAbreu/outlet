window.Admin = Spine.Controller.sub({elements:{".table":"table", ".tab-list a":"tabs", ".tab-title":"tabtitle", "#main .text":"inputs", "#main":"clientEl", ".scrollContent":"tbody"}, events:{"click .tab-list a":"tabsel", "click .enter-cart":"enter", "click .tab-close":"tabclose", "click .bclose":"close", "click .back":"close"}, close:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), $(a.target);
  } else {
    return!1;
  }
  if (this.getloading()) {
    return!1;
  }
  this.tabs.removeClass("sel");
  this.el.fadeOut(this.setactive);
}, enter:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  } else {
    return!1;
  }
  if (this.getloading()) {
    return!1;
  }
  a = a.attr("href").split("#")[1];
  var b = this.itemlist.filter(function(b) {
    return b.item.CNPJ === a;
  });
  b.length && this.fillform(b[0].item);
}, fillform:function(a) {
  this.tabtitle.text(a.CNPJ);
  this.tabs.eq(1).show().trigger("click");
  this.client.fill(a);
}, tabclose:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), $(a.target);
  } else {
    return!1;
  }
  if (this.getloading()) {
    return!1;
  }
  this.tabs.eq(1).hide();
  this.tabs.eq(0).trigger("click");
}, tabsel:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  } else {
    return!1;
  }
  if (this.getloading() || a.hasClass("sel")) {
    return!1;
  }
  var b = "." + a.attr("href").split("#")[1];
  ".tabs-1" === b && this.el.addClass("grid");
  ".tabs-2" === b && this.el.removeClass("grid");
  this.el.height(this.stage().h - 99);
  b = this.el.find(b);
  this.tabs.removeClass("sel").addClass("unsel");
  a.removeClass("unsel").addClass("sel");
  b.removeClass("hide").siblings("div").addClass("hide");
  this.page = 0;
  return!1;
}, create:function(a) {
  a.appendTo(this.tbody);
  this.itens = this.tbody.find("tr");
  this.itemlist.push(a);
}, init:function() {
  this.page = 0;
  this.itens = $([]);
  this.itemlist = [];
  this.setactive(this);
  this.el.addClass("grid");
  this.tbody.height(this.stage().h - 280);
  this.client = new Client({el:this.clientEl, modal:this.modal, getloading:this.proxy(this.getloading)});
  this.tabs.eq(1).hide();
  this.el.disableSelection();
}});
window.Spotlight = Spine.Controller.sub({elements:{dd:"buttons"}, events:{"click dd":"select"}, select:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  } else {
    return!1;
  }
  this.input.parent().addClass("fill");
  var b = a.prev().text();
  this.input.next().val(b);
  this.input.val(this.list + a.text()).blur();
  this.close();
}, over:function(a) {
  a.addClass("sel");
  var b = a.prev().text();
  this.input.next().val(b);
  this.input.val(this.list + a.text()).blur();
}, close:function(a) {
  if (a && (a.preventDefault(), a = $(a.target), this.el.find(a).length)) {
    return!1;
  }
  a && a.hasClass("bsearch") && this.input.trigger("submit");
  this.list = "";
  this.id = -1;
  this.doc.unbind("click");
  this.el.empty().fadeOut();
  return!1;
}, open:function(a) {
  var b, d, c, e = [];
  this.doc.unbind("click").bind("click", this.proxy(this.close));
  this.input = $(a.target);
  c = a.target.value;
  this.list && (c = c.replace(this.list, ""));
  if (2 > c.length) {
    return!1;
  }
  if (40 === a.keyCode || 38 === a.keyCode) {
    return this.arrow(a), !1;
  }
  if (48 <= a.keyCode && 90 >= a.keyCode || 8 == a.keyCode) {
    b = isNumber(c) ? this.spot.filter(function(a) {
      return-1 !== a.Cod.indexOf(c);
    }) : this.spot.filter(function(a) {
      return-1 !== a.Representante.toLowerCase().indexOf(c.toLowerCase());
    });
    c = null;
    for (d in b) {
      b[d].Cod && (c === b[d].Cod ? e.push("<dd>" + b[d].Representante + "</dd>") : (a = b.filter(function(a) {
        return a.Cod === b[d].Cod;
      }), a = 26 * a.length + 2, e.push("<dt style='height:" + a + "px'>" + b[d].Cod + "</dt><dd>" + b[d].Representante.capitalize() + "</dd>"), c = b[d].Cod));
    }
    this.el.html(e.join(" ")).fadeIn();
    this.buttons = this.el.find("dd");
  } else {
    return this.id = -1, !1;
  }
}, arrow:function(a) {
  a = a || window.event;
  this.buttons.removeClass("sel");
  switch(a.keyCode) {
    case 38:
      this.id--;
      this.id < -this.buttons.length && (this.id = 0);
      a = this.buttons.eq(this.id);
      this.over(a);
      break;
    case 40:
      this.id++, this.id > this.buttons.length - 1 && (this.id = 0), a = this.buttons.eq(this.id), this.over(a);
  }
  return!1;
}, init:function() {
  this.spot = [];
  this.list = "";
  this.id = 0;
  this.input = null;
  this.doc = $(document);
  $.getJSON(nodePath + "Cliente.svc/repre/", this.proxy(function(a) {
    this.spot = a;
  }));
  this.el.disableSelection();
}});
window.Client = Spine.Controller.sub({elements:{"#spotlight":"spotEl", "#modal":"modalEl", form:"main", "form input":"inputs", ".insc":"insc", ".delete":"deleteBt", ".toprep":"repEl", ".select-cart":"isento", "#wrap .mask":"maskEl"}, events:{"submit .client-form":"submit", "click .delete":"delitem", "click .bconfirm":"cep", "blur .cep":"cep", "focus .combo-input":"prompt", "click .bprompt":"prompt", "click .combo li":"combo", "click .select-cart":"select"}, init:function() {
  this.inputs.attr("autocomplete", "off");
  this.doc = $(document);
  this.loading = !1;
  this.cnpj = null;
  this.repEl.labelOver("over");
  $.getJSON("ajax/location.js", this.proxy(this.source));
  this.maskEl.height(this.stage().h);
  this.el.disableSelection();
}, submit:function(a) {
  a.preventDefault();
  var b, d, c = this, e = [], g = [];
  this.getloading(!0);
  b = this.isento.hasClass("on") ? "x" : " ";
  this.inputs.filter('[name="isento"]').val(b);
  a = arrayObject($(a.target).serializeArray());
  $.each(a, function(a, f) {
    d = !1;
    if (!f && "ie" === a && "x" === b || f && "ie" === a) {
      if (f && !isNumber(f) && "x" !== b) {
        return c.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", a.capitalize() + " inv\u00e1lido!", !0), !1;
      }
      f || (f = " ");
    } else {
      if (!f && "ie" === a && "x" !== b) {
        return c.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "Por favor preecher o campo " + a.capitalize() + ".", !0), !1;
      }
    }
    if (f && ("ddd1" === a || "telefone1" === a || "ddd2" === a || "telefone2" === a) && !isNumber(f) && " " !== f) {
      return c.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", a.capitalize() + " inv\u00e1lido!", !0), !1;
    }
    if (f || "complemento" === a || "ddd2" === a || "telefone2" === a) {
      f || (f = " ");
    } else {
      return c.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "Por favor preecher o campo " + a.capitalize() + ".", !0), !1;
    }
    if ("representante" === a && !c.repEl.find(".fill").length) {
      return c.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "Por favor preencher um Representante", !0), !1;
    }
    "cnpj" === a && (f = onlyNumbers(f));
    if ("email" === a && !isEmail(f)) {
      return c.modal.open("Campo obrigat\u00f3rio n\u00e3o preenchido", "E-Mail inv\u00e1lido!", !0), !1;
    }
    "senha" === a && (b = f);
    if ("csenha" === a && b !== f) {
      return c.modal.open("Erro ao confirmar Senha", "Senha e confirma\u00e7\u00e3o diferentes!", !0), !1;
    }
    "representante" !== a && "none" !== a && "csenha" !== a && (e.push(f), g.push(a + " : " + f));
    d = !0;
  });
  d || c.getloading(!1);
  d && e.push(c.el.find(".repcod").val()) && (g = e[0]) && (e = e.join("/"));
  d && $.getJSON(nodePath + "Cliente.svc/client/" + e + "/", function(a) {
    -1 !== a.indexOf("salvo") && $.getJSON(nodePath + "Cliente.svc/enviaSAP/" + g, function(a) {
      return-1 !== a.indexOf("CRM") ? (c.modal.open("Cadastro enviado com sucesso!", a, !1, c.proxy(c.getout)), !1) : (c.modal.open("Houve um erro ao enviar o cadastro.", "Dados n\u00e3o inv\u00e1lidos.", !0, c.proxy(c.getout)), !1);
    });
  });
  return!1;
}, delitem:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), $(a.target);
  } else {
    return!1;
  }
  this.modal.question("Deseja realmente exluir este cliente?", "", !1, this.proxy(this.commit));
}, commit:function() {
  $.getJSON(nodePath + "Cliente.svc/delete/" + this.cnpj, this.proxy(this.getout));
}, getout:function() {
  window.location = "admin.html";
}, prompt:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  } else {
    return!1;
  }
  if (a.hasClass("disable")) {
    return!1;
  }
  var b = a.parent().find(".combo");
  if (b.hasClass("open")) {
    return b.hide().removeClass("open"), !1;
  }
  a = a.parents("label").find("input");
  b.width(a.width() + 31);
  this.el.find(".open").hide().removeClass("open");
  b.addClass("open");
  b.fadeIn();
  b.tinyscrollbar();
  return!1;
}, source:function(a) {
  var b, d, c = this;
  this.inputs.filter(".combo-input").each(function(e) {
    e = $(this);
    d = e.next("input");
    e = e.parent().find(".combo-list");
    d = d.attr("name").toUpperCase();
    b = a.filter(function(a) {
      return a.INPUT === d;
    });
    c.fillbox(b, e);
  });
  return!1;
}, fillbox:function(a, b) {
  for (var d = [], c = 0;c < a.length;c++) {
    d.push('<li data="' + a[c].ID + '">' + a[c].VALUE + "</li>");
  }
  b.html(d.join(""));
  return!1;
}, combo:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  } else {
    return!1;
  }
  var b = a.parents("label").find(".combo");
  a.parents("label").find(".fake-input").val(a.attr("data"));
  a.parents("label").find(".combo-input").val(a.text());
  b.hide();
  b.removeClass("open");
  return!1;
}, getspot:function(a) {
  13 === a.keyCode ? (this.spotlight.close(), this.searchEl.trigger("submit")) : 1 < a.target.value.length ? this.spotlight.open(a) : this.spotlight.close();
  return!1;
}, cep:function(a) {
  "object" === typeof a && (a.preventDefault(), a = $(a.target));
  var b, d = this;
  (a = a.val() || a.prev().val()) && $.getJSON(nodePath + "CEP.svc/cep/" + a + "?callback=?", function(a) {
    a && a.CLIENT ? a.PAIS = "BR" : (d.modal.open("Campo Inv\u00e1lido", "CEP Digitado n\u00e3o encontrado. Por favor, digite novamente."), d.inputs.filter(".cep").val(""));
    for (var e in a) {
      (b = d.inputs.filter('[name="' + e.toLowerCase() + '"]')) && b.val(a[e].capitalize()), b.hasClass("fake-input") && b.parent().find('[data="' + a[e] + '"]').trigger("click");
    }
    d.el.find(".bprompt").addClass("disable");
  });
}, fill:function(a) {
  this.cnpj = a.CNPJ;
  a.Rua = a.Endereco;
  a.Senha = 0;
  var b;
  this.inputs.removeClass("off");
  this.isento.removeClass("on");
  for (var d in a) {
    (b = this.inputs.filter('[name="' + d.toLowerCase() + '"]')) && b.val(a[d]), b.hasClass("fake-input") && b.parent().find('[data="' + a[d] + '"]').trigger("click"), "X" === b.val() && this.isento.trigger("click");
  }
  this.repEl.find("input").val("");
  this.el.find(".bprompt").addClass("disable");
}, select:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  } else {
    return!1;
  }
  a.hasClass("on") ? this.insc.removeClass("off").attr("readonly", !1) : this.insc.addClass("off").attr("readonly", !0).val(" ");
  a.toggleClass("on");
}, stage:function() {
  var a, b;
  "number" === typeof window.innerWidth ? (a = window.innerWidth, b = window.innerHeight) : (a = document.documentElement.clientWidth, b = document.documentElement.clientHeight);
  return{w:a, h:b};
}});