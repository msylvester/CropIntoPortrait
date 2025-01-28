interact(".floating-box")
  .draggable({
    inertia: true,
    onmove: window.dragMoveListener,
    modifiers: [
      interact.modifiers.restrict({
        restriction: "parent",
        elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
      })
    ]
  })
  .resizable({
    edges: { left: true, right: true, bottom: true, top: true },
    modifiers: [
      // keep the edges inside the parent
      interact.modifiers.restrictEdges({
        outer: "parent"
        // endOnly: true
      }),

      // minimum size
      interact.modifiers.restrictSize({
        min: { width: 100, height: 50 }
      }),
      interact.modifiers.restrict({
        restriction: "parent"
        // elementRect: { top: 0, left: 0, bottom: 0, right: 0 }
      })
    ],
    inertia: true
  })
  .on("resizemove", function(event) {
    var target = event.target,
      x = parseFloat(target.getAttribute("data-x")) || 0,
      y = parseFloat(target.getAttribute("data-y")) || 0;

    // update the element's style
    target.style.width = event.rect.width + "px";
    target.style.height = event.rect.height + "px";

    // translate when resizing from top or left edges
    x += event.deltaRect.left;
    y += event.deltaRect.bottom;

    target.style.webkitTransform = target.style.transform =
      "translate(" + x + "px," + y + "px)";

    target.setAttribute("data-x", x);
    target.setAttribute("data-y", y);
    target.textContent =
      Math.round(event.rect.width) + "\u00D7" + Math.round(event.rect.height);
  });

function dragMoveListener(event) {
  // console.log("moving");
  var target = event.target;

  // keep the dragged position in the data-x/data-y attributes
  (x = (parseFloat(target.getAttribute("data-x")) || 0) + event.dx),
    (y = (parseFloat(target.getAttribute("data-y")) || 0) + event.dy);

  // translate the element
  target.style.webkitTransform = target.style.transform =
    "translate(" + x + "px, " + y + "px)";

  // update the position attributes
  target.setAttribute("data-x", x);
  target.setAttribute("data-y", y);
}

window.dragMoveListener = dragMoveListener;
