var Fiber = Npm.require('fibers');
Meteor.startup(function () {

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }


        Meteor.publish("circles", function () {
            return Circles.find();
        });
        console.log('circles pub');

        Meteor.publish("foods", function () {
            return Foods.find();
        });
        console.log('foods pub');


        Foods.remove({});
        for (var i = 0; i < 50; i++) {
            top_food = getRandomInt(10, 790);
            left_food = getRandomInt(10, 790);
            fill_food = colors[Math.floor(Math.random() * colors.length)];
            Foods.insert({top: top_food, left: left_food, fill: fill_food})

        }

        console.log('foods generated');

        setInterval(function () {
            Fiber(function () {
                var circles = Circles.find();
                circles.forEach(function (item) {

                    speed = (200 - item.radius) / 113 + 0.5;

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

                        Circles.update({_id: item._id}, {
                            $set: {
                                top: item.top + (go_top * speed),
                                left: item.left + (go_left * speed)
                            }
                        });
                    }

                    //Removing by timeout
                    if ((new Date()).getTime() - item.last_visit > 7000) {
                        Circles.remove({_id: item._id});
                    }

                    //Eating foods
                    Foods.find().forEach(function (food) {
                        diff_x = Math.abs(item.top - food.top - 5);
                        diff_y = Math.abs(item.left - food.left - 5);
                        if (diff_x < item.radius && diff_y < item.radius) {
                            Foods.remove({_id: food._id});
                            top_food = getRandomInt(10, 790);
                            left_food = getRandomInt(10, 790);
                            fill_food = colors[Math.floor(Math.random() * colors.length)];
                            Foods.insert({top: top_food, left: left_food, fill: fill_food});
                            new_radius = item.radius + 0.3;
                            if (new_radius > 200) {
                                new_radius = 200;
                            }
                            Circles.update({_id: item._id}, {
                                $set: {radius: new_radius}
                            });

                        }
                    });

                    //Eating Circles
                    Circles.find().forEach(function (another) {
                        diff_x = Math.abs(item.top - another.top);
                        diff_y = Math.abs(item.left - another.left);
                        if (item._id != another._id && diff_x < item.radius && diff_y < item.radius &&
                            (item.radius / another.radius) > 1.2) {
                            new_radius = item.radius + another.radius;
                            if (new_radius > 200) {
                                new_radius = 200;
                            }
                            Circles.update({_id: item._id}, {
                                $set: {radius: new_radius}
                            });
                            Circles.remove({_id: another._id});
                        }
                    });
                });

            }).run();
        }, 15);
    }
);