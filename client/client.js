Meteor.startup(function () {
    Meteor.subscribe('circles');
    Meteor.subscribe('foods');

    var canvas = this.__canvas = new fabric.Canvas('canvas');
    var drawings = {};
    var foods = {};
    var last_set = 0;


    var rand = colors[Math.floor(Math.random() * colors.length)];

    var circ = Circles.insert({
        top: 100,
        left: 100,
        radius: 30,
        fill: rand,
        last_visit: (new Date()).getTime()
    });

    setInterval(function () {
        Circles.update({_id: circ}, {
            $set: {last_visit: (new Date()).getTime()}
        });
    }, 5000);


    canvas.on('mouse:move', function (options) {
        var diff = (new Date()).getTime() - last_set;

        if (diff > 100) {
            var p = canvas.getPointer(options.e);

            Circles.update({_id: circ}, {
                $set: {to_top: p.y, to_left: p.x}
            });

            last_set = (new Date()).getTime();
        }
    });


    Circles.find().observe({
        changed: function (item) {
            drawings[item._id].set({
                top: item.top - item.radius,
                left: item.left - item.radius,
                radius: item.radius,
                fill: item.fill
            });
            canvas.renderAll();
        },
        added: function (item) {
            drawings[item._id] = new fabric.Circle({
                left: item.left - item.radius,
                top: item.top - item.radius,
                radius: item.radius,
                fill: item.fill
            });
            canvas.add(drawings[item._id]);
            canvas.renderAll();
        },
        removed: function (item) {
            canvas.remove(drawings[item._id]);
            canvas.renderAll();
        }
    });


    Foods.find().observe({
        added: function (item) {
            foods[item._id] = new fabric.Rect({
                left: item.left,
                top: item.top,
                fill: item.fill,
                width: 10,
                height: 10
            });
            canvas.add(foods[item._id]);
            foods[item._id].sendToBack();
            canvas.renderAll();
        },
        removed: function (item) {
            canvas.remove(foods[item._id]);
            canvas.renderAll();
        }
    });
});
