/\.odometer"\)\.length/ {
  N
  N
  N
  N
  N
  N
  N
  N
  N
  N
  N
  N
  N
  N
  c\
  if ($(".odometer").length) {\
    $(".odometer").each(function () {\
      var $this = $(this);\
      var countNumber = $this.attr("data-count");\
\
      var od = new Odometer({\
        el: this,\
        value: 0,\
        format: ""\
      });\
\
      setTimeout(function() {\
        od.update(countNumber);\
      }, 500);\
    });\
  }
}
