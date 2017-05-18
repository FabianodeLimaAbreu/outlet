window.Modal = Spine.Controller.sub({
   elements:{
      ".modal-content":"content", ".tut-content":"contut", ".tut-list li":"buttons", ".pag-list":"dots", ".tut-box":"box", ".modal-text h2":"title", ".modal-text p":"msg"
}, events:{
    "click .bclose":"close", "click .modal-buttons a":"action", "click .tut-list li":"select", "click .pag-list li":"page"
}, close:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), $(a.target);
  }
  this.el.fadeOut(function() {
    $(this).attr('class','hide');
  });
  this.callback && this.callback();
}, open:function(a, b, c, d) {
  a = a || "Titulo da Mensagem";
  b = b || "";
  this.content.removeClass("bad");
  c && this.content.addClass("bad");
  this.title.text(a.capitalize());
  this.msg.html(b);
  this.el.fadeIn();
  if(d && "function" === typeof d)
    this.callback = d;
}, question: function(a, b, c, d) {
  a = a || "Titulo da Mensagem";
  b = b || "";
  this.el.addClass("question");
  this.content.removeClass("bad");
  c && this.content.addClass("bad");
  this.title.text(a.capitalize());
  this.msg.html(b);
  this.el.fadeIn();
  this.callback = null;
  if(d && "function" === typeof d)
    this.confirm = d;
}, action:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  a.hasClass('confirm') && (this.callback = this.confirm);
  this.close();
}, tutorial:function(a) {
  a = a || 0;
  this.el.addClass("tutorial");
  this.content.removeClass("bad");
  this.buttons.eq(a).trigger("click");
  this.el.fadeIn();
}, contact:function(a) {
  this.mail = a;
  this.el.addClass("contact");
  //this.cinputs.removeClass('error');
  //this.warning.hide();
  this.content.removeClass("bad");
  this.el.fadeIn();
}, submit:function(a) {
    a.preventDefault();
    var d, e, f, t = this;
    a = arrayObject($(a.target).serializeArray());
    t.cinputs.removeClass('error');
    $.each(a, function(a, c) {
      d = !1;
      if(!c) {
        e = t.cinputs.filter('[name='+ a +']');
        return t.warning.fadeIn(), e.addClass('error'), !1;
      }
      d = !0;
    });
    if(d){
        f = [this.mail.EmailRepresentante, 'contatocomercial@focustextil.com.br', 'Contato cliente ' + this.mail.Cliente + ' Focus Outlet',  a.message, a.name, this.mail.Email];
        this.el.removeClass('contact');
        this.open("Enviando mensagem.", "Aguarde alguns instantes.", !1);
        $.getJSON(nodePath + "SendEmail.svc/send/" + f.join("/") + "?callback=?", this.proxy(function() {
            return this.open("Mensagem enviada com sucesso.", "Obrigado!", !1), !1;
        }));
    }else{
       return!1; 
    }
}, select:function(a) {
  var b;
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  if(a.hasClass("sel")) {
    return!1;
  }
  this.dots.find("li").hide();
  this.buttons.removeClass("sel");
  a.addClass("sel");
  b = this.tutlist.filter(function(b) {
    return-1 !== b.MENU.toLowerCase().indexOf(a.text().toLowerCase());
  });
  this.boxes(b);
}, page:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  }else {
    return!1;
  }
  if(a.hasClass("sel")) {
    return!1;
  }
  this.dots.find("li").removeClass("sel");
  a.addClass("sel");
  a = 610 * -a.index();
  this.contut.animate({left:a}, 400);
}, boxes:function(a) {
  this.contut.empty();
  for(var b = [], c, d = 0;d < a.length;d++) {
    c = "<div class='tut-box'><span class='tut-img' style='background-position: 0px -" + parseInt(130 * (a[d].ID - 1)) + "px'></span><h2><span class='tut-number'>" + parseInt(d + 1) + "</span>" + a[d].TITLE + "</h2><p>" + a[d].DESC + "</p></div>", b.push(c);
  }
  c = Math.round(a.length / 2);
  1 < c && this.dots.find("li:lt(" + c + ")").removeClass("sel").show().eq(0).addClass("sel");
  this.contut.width(320 * a.length).html(b.join(" ")).animate({left:0}, 0);
}, init:function() {
  this.tutlist = [];
  this.callback = null;
  $.getJSON("ajax/tutorial.js", this.proxy(function(a) {
    this.tutlist = a;
  }));
  this.el.disableSelection && this.el.disableSelection();
}});
window.Content = Spine.Controller.sub({elements:{".table":"table", ".scrollContent":"tbody"}, changeview:function(a) {
  this.create = this[a];
  "images" === a ? this.itens && this.clean() : this.itens && this.reset();
  this.tbody.empty();
  this.table.hide()
}, images:function(a) {
  this.append(a);
  this.itens = this.el.find(".box");
  this.itemlist.push(a)
}, list:function(a) {
  a.appendTo(this.tbody);
  this.itens = this.tbody.find("tr");
  this.itemlist.push(a)
}, clean:function() {
  this.itens.remove()
}, reset:function() {
  this.clean()
}, init:function() {
  this.itens = $([]);
  this.itemlist = [];
  this.page = 0;
  this.el.disableSelection && this.el.disableSelection();
}});
window.Box = Spine.Controller.sub({init:function() {
  this.template = this[this.view]
}, elements:{a:"button"}, events:{"click .add-cart":"add", "click .delete":"remove", "change .qtd":"refreshqtd", "click .detail":"opendetail","click .detailcart":"opendetailByCart", "click .cancel-info":"cancelinfo"
}, render:function(a) {
  a && (this.item = a);
  this.html(this.template(this.item));
  "images" === this.view && this.el.find(".box").prepend(this.url);
  return this
}, images:function(a) {
  var estoque,uni;
  this.url.className = "detail";

  /***** BLACK WEEK CODE ***/
  var i;
  for(i=0;i<this.blackweek.length;i++){
    if(this.blackweek[i].MATSKU === a.MATNR){
      //console.dir(this.blackweek[i]); 
      this.el.addClass('blackweek');
    }
  }
  /***** END BLACK WEEK CODE ***/
    
  //console.dir(a);
  if(isNaN(a.PE)){
    pe="Indisponível";
    uni="";
  }
  else{
    pe=Math.floor(a.PE);
    if(a.UNIDADE_MEDIDA === "MT"){    
      uni="m";
    }
    else{
      uni=a.UNIDADE_MEDIDA;
    }
  }
  estoque = "<ul><li>Pronta Entrega: " + pe +" "+uni.toLowerCase()+ "</li></ul>";
  return"<div class='box'>" + ("<div class='box-info'>" + ("<h3>" + a.MATNR + "</h3>") + ("<h4>" + a.MAKTX + "</h4>") + estoque +"<a href='#' class='add-cart'><span class='icon'></span>Incluir no Carrinho</a></div>") + "</div>"
}, list:function(a) {
  var c,uni, b = [];
  if(a.UNIDADE_MEDIDA === "MT"){    
    uni="m";
  }
  else{
    uni=a.UNIDADE_MEDIDA;
  }
  a.GRUPO && (b = ["<a href='#' class='icon add-cart add'></a>", "<a href='#' class='detail'>" + a.MAKTX + "</a>", a.MATNR, a.GRUPO.toUpperCase(), a.SGRUPO.toUpperCase(),Math.floor(a.PE)+" "+uni.toLowerCase()]);
  a.GRUPO || a.MEDIA_PECA && (b = ["<a href='#' class='icon remove-cart delete'></a>", "<a href='#' class='detailcart' name='"+a.MATNR+"'>" + a.MAKTX + "</a>", a.MATNR, parseInt(a.MEDIA_PECA, 10) + " " + a.UNIDADE_MEDIDA.replace('MT','m'), "<input name='qtd' type='text' class='text s-one qtd' value='" + parseInt(a.QUANTIDADE, 10) + "' />"]);
  a.Status && (c = a.DataHora.toDate(), b = ["<a href='#" + a.Pedido + "' class='icon enter-cart'></a>", a.Pedido, a.Status, c.format("dd/MM/yyyy hh:mm") + "h"]);
  if(a.Status === "")
    return !1;
  //MUDOU
  a.Multiplo && (c = (a.Cancelado)?("<span class='warning'>CANCELADO</span><a href='#' class='icon neat cancel-info'></a>"):((a.Status.indexOf('Enviado') !== -1)?'AGUARDANDO':'<span class="accept">APROVADO</span>'), b = ["<a href='#" + a.Matnr + "' class='icon select-cart'></a>", "<a href='#' class='detailcart' name='"+a.Matnr+"'>" + a.Desc + "</a>", a.Matnr, parseInt(a.Multiplo, 10)  + " " + a.Unidade.replace('MT','m'), "<input name='qtd' type='text' class='text s-mhalf off qtd' value='" + parseInt(a.Quantidade, 10) + "' disabled/>", c]);
  a.AddDate && (c = a.AddDate.replace(/-/g, '/'), b = ["<a href='#" + a.CNPJ + "' class='icon enter-cart'></a>", a.Razao, a.CNPJ, c + "h"]);
  return"<td>" + b.join("</td><td>") + "</td>"
}, add:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target)
  }else {
    return!1
  }
  a.attr("href") || (a = a.parent());
  a = this.change(a);
  this.reloadcart(this.item, a)
}, change:function(a) {
  var b, c;
  a = a || this.button.not(".detail");
  a.hasClass("remove-cart") ? (b = a.html().replace("Remover do", "Incluir no"), c = "delete", a.removeClass("remove-cart")) : (b = a.html().replace("Incluir no", "Remover do"), c = "insert", a.addClass("remove-cart"));
  console.log("mudou: " + this.item.MATNR + " " + c);
  a.html(b);
  return c
}, refreshqtd:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), a = $(a.target)
  }else {
    return!1
  }
  var c, b = parseInt(this.item.MEDIA_PECA, 10);
  c = parseInt(a.val(), 10);
  (c % b || c === 0 || !c) ? (a.val(b), this.modal.open("Calculo da quantidade:", "Quantidade do artigo <b>" + this.item.MATNR +" "+ this.item.MAKTX.capitalize() + "</b> deve ser calculada em m\u00faltiplos de " + b +".", !0)) : (this.item.QUANTIDADE = c, this.reloadcart(this.item, "insert"));
}, opendetail:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), $(a.target)
  } else {
    return!1
  }
  this.detail.open(this.item);
}, opendetailByCart:function(a){
  //MUDOU
  if("object" === typeof a) {
    a.preventDefault(), $(a.target);
  } else {
    return!1;
  }
  this.detail.reload($(a.target).attr("name"));
}, cancelinfo:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), $(a.target)
  }else {
    return!1
  }
  this.modal.open('Motivo do Cancelamento',this.item.Cancelado, !0);
  //this.detail.open(this.item);
}, remove:function(a) {
  if("object" === typeof a) {
    a.preventDefault(), $(a.target)
  }else {
    return!1
  }
  var b = this.el.parent();
  this.el.remove();
  b.find('tr').removeClass('odd').filter(":odd").addClass("odd");
  this.reloadcart(this.item, "delete", !0)
}});