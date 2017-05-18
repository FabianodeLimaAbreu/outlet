window.Cart = Spine.Controller.sub({elements:{".table":"table", ".address-box":"promptEl", ".tab-list a":"tabs", ".tab-title":"tabtitle", ".cart-form .text":"cartinputs", ".tab-form .text":"tabinputs", ".scrollContent":"tbody", ".send":"sendbt", ".addsel":"addselbt", ".print":"printbt", ".mailcopy":"mailbt"}, events:{"click .tab-list a":"tabsel", "click .bopen":"openprompt", "click .send":"send", "click .mailcopy":"mailcopy", "click .addsel":"addsel", "click .enter-cart":"enter", "click .select-cart":"select", 
"click .tab-close":"tabclose", "click .bclose":"close", "click .back":"close"}, close:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), $(a.target);
  }else {
    return!1;
  }
  if(this.getloading()) {
    return!1;
  }
  this.navigate('result', !1);
  this.tabs.removeClass("sel");
  this.toclean.length && this.updatelist(this.toclean);
  this.prompt.close();
  this.el.fadeOut(this.setactive);
}, enter:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  if(this.getloading()) {
    return!1;
  }
  a = a.attr("href").split("#")[1];
  a = this.itemlist.filter(function(b) {
    return b.item.Pedido === a;
  });
  a.length && (a = a[0].item);
  var b = [a.Pedido, a.Status, a.DataHora.toDate().format("dd/MM/yyyy hh:mm") + "h"];
  this.tabinputs.each(function(a, d) {
    d.value = b[a];
  });
  this.tabtitle.text(b[0]);
  this.mailbt.attr("href", "#" + b[0]);
  this.tabs.eq(2).show().trigger("click");
  return!1;
}, select:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  a.toggleClass("on");
  return!1;
}, openprompt:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  if(this.getloading() || a.hasClass("disable")) {
    return!1;
  }
  a.addClass("sel");
  this.prompt.active ? this.prompt.close() : this.prompt.open();
}, mailcopy:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  if(this.getloading()) {
    return!1;
  }
  a = a.attr("href").split("#")[1];
   $.getJSON(nodePath + "service=Pedidos.svc/reenviar/&query=" + a + "?callback=?", this.proxy(function(a) {
    this.modal.open("E-Mail enviado com sucesso.", "Verifique o e-mail: " + this.usr.Email, !1)
  }))
}, tabclose:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), $(a.target)
  }else {
    return!1
  }
  if(this.getloading()) {
    return!1
  }
  this.tabs.eq(2).hide();
  this.tabs.eq(1).trigger("click")
}, send:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target)
  }else {
    return!1
  }
  var b, c = [], d = this;
  a = this.tbody.find("tr").length;
  b = this.cartinputs.filter(".address").val();
  if(this.getloading() || !a || null === b.match(/[0-9]/)) {
    return a || d.modal.open("Carrinho vazio.", "Por favor, adicionar itens no carrinho para efetuar um Pr\u00e9-Pedido.", !0), null === b.match(/[0-9]/) && d.modal.open("Endere\u00e7o de Entrega.", "Por favor, selecione um Endere\u00e7o de Entrega."), b = 0, !1
  }
  this.itemlist.forEach(function(a) {
    c.push([a.item.MATNR, a.item.MAKTX])
  });
  d.modal.open("Enviando Pedido", "Por favor aguarde alguns instantes.");
  this.getloading(!0);
  $.getJSON(nodePath + "service=PrePedido.svc/cnpj/&query=" + this.usr.CNPJ + "/" + b + "/X?callback=?", function(a) {
    a = a.join("<br>").toLowerCase();
    if(-1 !== a.indexOf("gravado")) {
      a = a.split("<br>")[0];
      d.modal.open("Recebemos seu Pr\u00e9-Pedido com Sucesso!", "O Pré-Pedido código &nbsp;<b>"+ a +"</b> foi enviado para Focus com sucesso. <br>Aguarde nosso contato no prazo de 8 horas para informa\u00e7\u00f5es sobre as condi\u00e7\u00f5es de pagamento e valores. Pré-Pedido sujeito a aprova\u00e7\u00e3o de cr\u00e9dito."), d.getloading(!1), d.toclean = d.itemlist, d.getcart(), d.load()
    }else {
      return-1 !== a.indexOf("quantidade") && d.modal.open("Pr\u00e9-Pedido n\u00e3o aprovado.", a.split(":")[0].initialCaps() + ":<b>" + a.split(":")[1].toUpperCase() + "</b><br>Informe uma quantidade.", !0), -1 !== a.indexOf("disponivel") && c.forEach(function(b) {
        return-1 !== a.indexOf(b[0].toLowerCase()) && d.modal.open("Pr\u00e9-Pedido n\u00e3o aprovado.", "N\u00e3o exite estoque disponivel para o material: <b>" + b.join("<br>") + "</b><br>Por favor contate seu Representante.", !0), !1
      }), d.getloading(!1), !1
    }
  })
}, addsel:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), $(a.target);
  }else {
    return!1;
  }
  var b, c;
  for(a = 0;a < this.itemlist.length;a++) {
        b = this.itemlist[a].el.find(".on"), b.length && (b.removeClass("on"), b = this.itemlist[a].item, c = [this.usr.CNPJ, b.Matnr, b.Desc, parseInt(b.Multiplo, 10), parseInt(b.Quantidade, 10)], $.getJSON("http://189.126.197.168/Focus24Dev/Services/Cart.svc/insert/" + c.join("/") + "?callback=?", this.proxy(this.getcart)), c = !0);
  }
  if(!c) {
    return this.modal.open("N\u00e3o h\u00e1 itens selecionados!", "Por favor selecione ao menos um item na lista.", !0), !1;
  }
  this.modal.open("Itens adicionados ao Carrinho com sucesso!", "Clique na aba <b>Itens do Carrinho</b> para enviar seu pedido.");
}, tabsel:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  if(this.getloading() || a.hasClass("sel") || !a.attr("href")) {
    return!1;
  }
  var b, c = "." + a.attr("href").split("#")[1];
  this.tbody.find("tr").fadeOut();
  this.el.height(this.stage().h - 99);
  this.el.find(".bopen").addClass("disable");
  b = this.el.find(c);
  this.tabs.removeClass("sel").addClass("unsel");
  a.removeClass("unsel").addClass("sel");
  b.removeClass("hide").siblings("div").addClass("hide");
  this.tbody = b.find("tbody");
  a = this.usr.CNPJ;
  this.getloading(!0);
  this.tutpage = ".tabs-1" === c ? 3 : 4;
  ".tabs-1" === c && (this.getcart(this.proxy(this.load)), this.tbody.height(this.stage().h - 405), this.sendbt.show(), this.addselbt.hide(), this.mailbt.hide(), this.el.find(".bopen").removeClass("disable"));
  ".tabs-2" === c && ($.getJSON(nodePath + "service=Pedidos.svc/Cnpj/&query=" + a + "/X?callback=?", this.proxy(this.load)), this.tbody.height(this.stage().h - 405), this.sendbt.hide(), this.addselbt.hide(), this.mailbt.hide());
  ".tabs-3" === c && ($.getJSON(nodePath + "service=Pedidos.svc/Pedido/&query=" + this.usr.CNPJ + "/" + this.tabtitle.text() + "?callback=?", this.proxy(this.load)), this.tbody.height(this.stage().h - 494), this.sendbt.hide(), this.addselbt.show(), this.mailbt.show());
  this.page = 0;
  return!1;
}, open:function(a) {
  this.tabs.eq(a || 0).trigger("click");
  this.tabs.eq(2).hide();
  $("body").addClass("noscroll");
  $(".bback").trigger("click");
  this.el.fadeIn();
}, create:function(a) {
  a.appendTo(this.tbody);
  this.itens = this.tbody.find("tr");
  this.itemlist.push(a);
}, load:function(a) {
  a && a.length && (this.data = a);
  this.tbody.empty();
  this.itemlist = [];
  this.itens = $([]);
  a && 0 < a.length ? this.createbox(a, 0, !0, "list") : this.getloading(!1);
  this.setactive(this);
}, init:function() {
  this.itens = $([]);
  this.data = [];
  this.tutpage = this.page = 0;
  this.itemlist = [];
  this.toclean = [];
  var a = [this.usr.CodCliente + " - " + this.usr.Nome, this.usr.CodRepresentante + " - " + this.usr.Representante, this.usr.CNPJ];
  this.cartinputs.each(function(b, c) {
    c.value = a[b];
  });
  this.prompt = new Prompt({el:this.promptEl, mask:this.mask, cnpj:this.usr.CNPJ, button:this.el.find(".bopen"), input:this.cartinputs.filter(".address")});
  this.el.disableSelection && this.el.disableSelection();
}});
window.Prompt = Spine.Controller.sub({elements:{".select-address":"buttons"}, events:{"click .select-address":"action"}, action:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  this.input.val(a.attr("href").split("#")[1]);
  this.buttons.removeClass("on");
  a.toggleClass("on");
  this.close();
}, close:function(a) {
  if(a && (a.preventDefault(), a = $(a.target), this.el.find(a).length)) {
    return!1;
  }
  this.button.removeClass("sel");
  this.el.fadeOut();
  return this.active = !1;
}, select:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  a.toggleClass("on");
}, open:function(a) {
  this.el.fadeIn();
  this.active = !0;
  this.el.find("tr").fadeIn();
}, init:function() {
  var a = this, b = [], c = [];
  $.getJSON(nodePath + "service=Cart.svc/EndEntrega/&query=" + this.cnpj + "?callback=?", function(d) {
    if(!d.length) {
      return a.input.parents("label").addClass("hide"), !1;
    }
    a.input.val("Escolha um Endere\u00e7o de Entrega");
    d.forEach(function(a) {
      b = ["<a href='#" + a.CNPJ + "' class='icon select-address'></a>", a.CNPJ, a.RAZAO, a.ENDERECO, a.CEP];
      c.push("<td>" + b.join("</td><td>") + "</td>");
    });
    a.el.find("tbody").html("<tr>" + c.join("</tr><tr>") + "</tr>").find("tr").filter(":odd").addClass("odd");;
    a.buttons = a.el.find(".select-address");
    
  });
  this.active = !1;
  this.el.disableSelection && this.el.disableSelection();
}});