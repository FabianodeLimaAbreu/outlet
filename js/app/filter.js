window.Filter = Spine.Controller.sub({elements:{".button-list":"listEl", ".filter-list":"filterEl", ".bfilter":"bfilter", ".open-left":"openIco"}, events:{"click .bfilter":"open", "click .bconfirm":"confirm", "click .button-list a":"select", "click .bfclose":"close", "click .bcancel":"cancel", "click .filter-list .button":"add"}, open:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), $(a.target);
  } else {
    return!1;
  }
  this.getloading() || ($("#search").addClass("search-disabled").find(".text").attr("disabled","disabled"),this.mask.fadeIn().find(".loader").hide(), this.bfilter.addClass("sel"), this.bfilter.addClass("open"), this.listEl.animate({width:"show"}, 400));
}, add:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  } else {
    return!1;
  }
  var b, c, d;
  b = this.listEl.find(".sel").attr("href").split("#")[1];
  c = a.attr("data");
  d = this.listEl.find("a").index(this.listEl.find(".sel"));
  a.hasClass("sel") ? (b = this.list.filter(function(a) {
    return a.id === d && a.ft === c;
  }), this.list = this.list.diff(b), a.removeClass("sel")) : (this.list.push({id:d, bt:b, ft:c}), a.addClass("sel"));
}, close:function(a) {
  $("#search").removeClass("search-disabled").find(".text").removeAttr("disabled");
  "object" === typeof a && (a.preventDefault(), a = $(a.target));
  var b = this;
  this.getloading() || this.mask.fadeOut();
  this.bfilter.removeClass("sel");
  this.filterEl.slideUp("slow", function() {
    b.listEl.animate({width:"hide"}, 400, function() {
      b.bfilter.removeClass("open");
    }).find("a").not(".s-quart").not(".s-fifty").removeClass("sel").addClass("unsel");
  });
}, cancel:function(a) {
  "object" === typeof a && (a.preventDefault(), $(a.target));
  this.listEl.find("a").not(".s-quart").not(".s-fifty").removeClass("sel").addClass("unsel");
  this.filterEl.slideUp("slow");
  this.list = [];
  this.setdata(this.list);
  this.close();
  return!1;
}, confirm:function(a) {
  if ("object" === typeof a) {
    a.preventDefault();
  } else {
    return!1;
  }
  var b, c, d, e = this, g, f;
  this.list = this.list.sortBy("id");
  c = this.list.map(function(a, b) {
    return a.id;
  });
  c = c.unique();
  for (b = 0;b < c.length;b++) {
    if (a = this.list.filter(function(a) {
      return a.id === c[b];
    }), a.length && (g = []) && a.forEach(function(a) {
      g = d = g.concat(e.reload(a, f));
      //console.log(a.bt + " " + a.ft + " " + d.length);
    }), f = d, !f.length) {
      return this.setdata(f.unique()), this.close(), !1;
    }
  }
  f = f || this.data;
  this.setdata(f.unique());
  this.close();
}, select:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  } else {
    return!1;
  }
  if (!a.hasClass("unsel") || a.hasClass("off")) {
    return!1;
  }
  this.filterEl.empty().hide();
  this.listEl.find("a").not(".s-quart").not(".s-fifty").removeClass("sel").addClass("unsel");
  a.addClass("sel").removeClass("unsel");
  var b = a.attr("href").split("#")[1];
  (a = this.getfilter(b)) && this.setfilters(a.sort(), b);
  this.filterEl.slideDown("slow");
}, setfilters:function(a, b) {
  var c, d, e = [];
  d = this;
  a.forEach(function(a) {
    c = d.list.length ? d.list.filter(function(c) {
      return c.bt === b && c.ft === a;
    }) : !1;
    c = parseInt(c) || c.length ? "sel" : " ";
    c = 20 > a.length ? c : c + " big";
    e.push('<li><span class="button two neat ' + c + '" data="' + a + '">' + a.toLowerCase().capitalize() + "</span></li>");
  });
  this.filterEl.html(e.join(""));
}, getfilter:function(a) {
  var b, c;
  if ("CMP" !== a) {
    for (var d = [], e = 0;e < this.data.length;e++) {
      (b = this.data[e][a]) && " " !== b && 0 !== parseInt(b, 10) && 1 !== parseInt(b, 10) && d.push(b);
    }
  } else {
    for (d = [], e = 0;e < this.data.length;e++) {
      for (c = 0;5 > c;c++) {
        (b = this.data[e][a + (c + 1)]) && " " !== b && d.push(b);
      }
    }
  }
  return d.unique();
}, reload:function(a, b) {
  var i,d=[];
  b = b || this.data;
  if("CMP" !== a.bt) {
    //console.log("1");
    return b.filter(function(b) {
      //console.log(b[a.bt].toUpperCase()+" , "+a.ft+" = "+b[a.bt].toUpperCase().indexOf(a.ft.toUpperCase()));
      return b[a.bt] && -1 !== b[a.bt].toUpperCase().indexOf(a.ft.toUpperCase());
      
    });
  }
  if(!a.pc) {
    c=b;
    c=c.filter(function(b){
      //console.log("22");
      for(i=1;7 > i;i++){
        if(b[a.bt+""+i]){
          //Caso tenha valor na composição
          if((b[a.bt+""+i].toUpperCase().indexOf(a.ft))+1){
            return 1;
          }
        }
      }
      return 0;
    });
    if(c.length){
      if(d.length){
        d.concat(c);
      }
      else{
        d = c;
      }
    }
    return d;
  }
}, checklist:function(a) {
  this.data = a;
  var b, c;
  a = this.listEl.find(".unsel");
  b = this;
  a.each(function() {
    $(this).removeClass("off");
    c = $(this).attr("href").split("#")[1];
    c = b.getfilter(c);
    c.length || $(this).addClass("off");
  });
  this.close();
  this.el.fadeIn();
}, init:function() {
  this.list = [];
  this.data = null;
  this.el.disableSelection && this.el.disableSelection();
}});
window.Spotlight = Spine.Controller.sub({elements:{dd:"buttons"}, events:{"click dd":"select"}, select:function(a) {
  if ("object" === typeof a) {
    a.preventDefault(), a = $(a.target);
  } else {
    return!1;
  }
  this.input.val(this.list + a.text()).focus();
  this.close();
}, over:function(a) {
  a.addClass("sel");
  this.input.val(this.list + a.text()).focus();
}, close:function(a) {
  if (a && (a.preventDefault(), a = $(a.target), this.el.find(a).length)) {
    return!1;
  }
  a && a.hasClass("bsearch") && this.input.trigger("submit");
  this.input && this.input.focus();
  this.list = "";
  this.id = -1;
  this.doc.unbind("click");
  this.el.empty().fadeOut();
  return!1;
}, open:function(a) {
  var b, c, d, e = [];
  this.doc.unbind("click").bind("click", this.proxy(this.close));
  this.input = $(a.target);
  d = a.target.value;
  this.list && (d = d.replace(this.list, ""));
  if (2 > d.length) {
    return!1;
  }
  if (40 === a.keyCode || 38 === a.keyCode) {
    return this.arrow(a), !1;
  }
  if (48 <= a.keyCode && 90 >= a.keyCode || 8 == a.keyCode) {
    b = this.spot.filter(function(a) {
      return-1 !== a.VALUE.toLowerCase().indexOf(d.toLowerCase());
    });
    d = null;
    for (c in b) {
      b[c].DESC && (d === b[c].DESC ? e.push("<dd>" + b[c].VALUE + "</dd>") : (a = b.filter(function(a) {
        return a.DESC === b[c].DESC;
      }), a = 26 * a.length + 2, e.push("<dt style='height:" + a + "px'>" + b[c].DESC.capitalize() + "</dt><dd>" + b[c].VALUE + "</dd>"), d = b[c].DESC));
    }
    this.el.html(e.join(" ")).fadeIn();
    this.buttons = this.el.find("dd");
  } else {
    this.id = -1, 32 === a.keyCode && (this.list += d);
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
  $.getJSON("/library/ajax/spotlight.js", this.proxy(function(a) {
    this.spot = a;
  }));
  this.el.disableSelection && this.el.disableSelection();
}});