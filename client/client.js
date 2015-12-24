Meteor.startup(function () {
    Meteor.subscribe('circles');
    Meteor.subscribe('foods');

    var canvas = this.__canvas = new fabric.Canvas('canvas');
    var drawings = {};
    var foods = {};
    var last_set = 0;


    var rand = colors[Math.floor(Math.random() * colors.length)];

    var circ = Circles.insert({top: 100, left: 100, radius: 30, fill: rand, last_visit: (new Date()).getTime()});

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


    setInterval(function () {
        circles = Circles.find();
        circles.forEach(function (item) {
            speed = 1;

            top_diff = Math.abs(item.to_top - item.top);
            left_diff = Math.abs(item.to_left - item.left);

            if (top_diff > 2 || left_diff > 2) {

                if (top_diff < left_diff) {
                    diff = top_diff / left_diff;
                    go_top = diff;
                    go_left = 1 - diff;
                } else {
                    diff = left_diff / top_diff;
                    go_top = 1 - diff;
                    go_left = diff;
                }

                if (item.to_top < item.top) {
                    go_top = -go_top;
                }

                if (item.to_left < item.left) {
                    go_left = -go_left;
                }

                how_long = (new Date()).getTime() - item.updated;

                time_diff = (how_long / 15);

                drawings[item._id].set({
                    top: item.top + (go_top * time_diff),
                    left: item.left + (go_left * time_diff)
                });
                canvas.renderAll();
                Circles._collection.update({_id: item._id}, {
                    $set: {
                        top: item.top + (go_top * speed),
                        left: item.left + (go_left * speed),
                        updated: (new Date()).getTime()
                    }
                });
            }
        })
    }, 15);


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
        }
    });
});
