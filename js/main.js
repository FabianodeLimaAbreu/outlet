require.config({shim:{spine:{deps:["jquery"], exports:"Spine"}}, baseUrl:"js/lib", paths:{app:"../app", models:"../models", sp:"spine"}});
require("methods sp/spine app/admin app/content".split(" "), function() {
  window.App = Spine.Controller.sub({el:$("body"),
    elements:{"#admin":"adminEl", "#spotlight":"spotEl", "#alt-menu":"menuEl", "#content":"contentEl", "#modal":"modalEl", "#wrap .user-name":"userTx", "#wrap .mask":"maskEl"},
    events:{"keyup .toprep .text":"getspot", "click #wrap .user-logout":"logout"}, init:function() {
    this.usr = null;
    (this.usr = jQuery.parseJSON($.cookie("admin"))) || this.logout();
    this.userTx.text(this.usr.LOGIN);
    this.el.find("#wrap").removeClass("hide");
    this.data = [];
    this.fdata = [];
    this.view = "list";
    this.modal = new Modal({el:this.modalEl});
    this.el.disableSelection();
    this.content = new Content({el:this.contentEl, stage:this.proxy(this.stage)});
    $.getJSON(nodePath + "Cliente.svc/adm/?callback=?", this.proxy(this.setdata));
    this.loading = !1;
    this.spotlight = new Spotlight({el:this.spotEl});
  }, getspot:function(a) {
     $(a.target).parent().removeClass('fill');
     if(a.keyCode === 13){
        this.spotlight.close(), this.searchEl.trigger('submit');
     }else{
        (a.target.value.length > 1)?this.spotlight.open(a):this.spotlight.close()
     }
     return !1;
  }, setactive:function(a) {
    this.active = a || this.content;
    this.maskEl.addClass("adtop").height(this.stage().h - 220);
    a && this.scroll(this.active.tbody);
  }, getloading:function(a) {
    a && !this.loading ? (this.maskEl.fadeIn(), this.loading = !0) : !1 === a && this.loading && (this.maskEl.fadeOut(), this.loading = !1);
    return this.loading
  }, setdata:function(a, b, c) {
      this.data = a;
      this.admin = new Admin({el:this.adminEl, data: a, usr:this.usr, setactive:this.proxy(this.setactive), modal:this.modal, createbox:this.proxy(this.createbox), getloading:this.proxy(this.getloading), stage:this.proxy(this.stage)});
      this.createbox(this.data, this.content.page, !1);
  }, createbox:function(a, b, d, c) {
    var f, m, g, n, v;
    c = c || this.view;
    n = "images" === c ? "div" : "tr";
    this.loading = !0;
    this.maskEl.fadeIn().find(".loader").show();
    this.active = this.active || this.content;
    d = this.active.itens && !d ? this.active.itens.length : 0;
    m = 24 * (b + 1) < a.length ? 24 * (b + 1) : a.length;
    var p, h, q, k = 24 * b, l = m - k, e = this;
    if(d < a.length && a[k]) {
      f = setInterval(function() {
          h = a[k];
          if(l > 0) {
            return g = new Box({item:h, view:c, tag:n, modal:e.modal}), e.active.create(g.render()), l--, k++, !1
          }else{
            clearInterval(f), e.endloading()
          }
      }, 100)
    }else {
      return this.endloading(), !1
    }
  }, endloading:function(a) {
    a && clearInterval(a);
    var b = this;
    this.active.itens.fadeIn(function() {
      b.getloading(!1);
      b.active.tbody.find("tr").filter(":odd").addClass("odd");
      b.active.tbody.find("input").parent().addClass("ajust")
    });
  }, logout:function(a) {
    a && a.preventDefault();
    this.usr && $.cookie("admin", null, {path:"/"});
    window.location.href = "login.html#admin"
  }, stage:function() {
    var a, b;
    "number" === typeof window.innerWidth ? (a = window.innerWidth, b = window.innerHeight) : (a = document.documentElement.clientWidth, b = document.documentElement.clientHeight);
    return{w:a, h:b}
  }, scroll:function(z) {
    var a, b, d, c, f = this;
    z = z || $(window);
    $.hasData(z[0]) && z.unbind('scroll');
    if(!f.active.itens){
        return !1;
    }
    z.scroll(function() {
      f.modal.close();
      b = z.scrollTop();
      d = ('list' === f.view || f.active !== f.content) ? f.active.itens.length*40 : $(document).height();
      c = z.height();
      a = Math.ceil(f.active.data.length / 24);
     // console.log(a + " " + f.active.page  + " " + c + " " + f.loading);
      0.95 < b / (d - c) && (!f.loading && f.active.page < a && (f.active.page++, (f.active === f.content)?f.createbox(f.data, f.active.page):f.createbox(f.active.data, f.active.page, !0, "list")));
    })
  }});
  new App
});