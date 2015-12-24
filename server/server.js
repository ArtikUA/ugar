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

        var how = 0;

        var temp = {};

        setInterval(function () {
            Fiber(function () {
                var circles = Circles.find();
                circles.forEach(function (item) {

                    speed = 1;

                    item_top = item.top;


                    if (temp[item._id] && temp[item._id].top != item.top) {
                        item_top = temp[item._id].top;
                    }

                    item_left = item.left;

                    if (temp[item._id] && temp[item._id].left != item.top) {
                        item_left = temp[item._id].left;
                    }

                    updated = item.updated;

                    if (temp[item._id] && temp[item._id].updated != item.updated) {
                        updated = temp[item._id].updated;
                    }

                    top_diff = Math.abs(item.to_top - item_top);
                    left_diff = Math.abs(item.to_left - item_left);

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

                        if (item.to_top < item_top) {
                            go_top = -go_top;
                        }

                        if (item.to_left < item_left) {
                            go_left = -go_left;
                        }

                        how_long = (new Date()).getTime() - updated;


                        time_diff = (how_long / 15);


                        temp[item._id] = {
                            top: item_top + (go_top * time_diff),
                            left: item_left + (go_left * time_diff),
                            updated: (new Date()).getTime()
                        };

                        //item_left =

                        if (how == 10) {
                            Circles._collection.update({_id: item._id}, {
                                $set: {
                                    top: temp[item._id].top,
                                    left: temp[item._id].left,
                                    updated: (new Date()).getTime()
                                }
                            });
                            delete temp[item._id];


                        }
                    }
                    if (temp[item._id]) {
                        temp[item._id].updated = (new Date()).getTime();
                    } else {
                        temp[item._id] = {
                            top: item_top,
                            left: item_left,
                            updated: (new Date()).getTime()
                        };

                    }

                    if ((new Date()).getTime() - item.last_visit > 7000) {
                        Circles.remove({_id: item._id});
                    }

                    Foods.find().forEach(function (food) {


                        item_top = item.top;


                        if (temp[item._id] && temp[item._id].top != item.top) {
                            item_top = temp[item._id].top;
                        }

                        item_left = item.left;

                        if (temp[item._id] && temp[item._id].left != item.top) {
                            item_left = temp[item._id].left;
                        }


                        diff_x = Math.abs(item_top - food.top);
                        diff_y = Math.abs(item_left - food.left);
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

                    Circles.find().forEach(function (another) {

                        item_top = item.top;


                        if (temp[item._id] && temp[item._id].top != item.top) {
                            item_top = temp[item._id].top;
                        }

                        item_left = item.left;

                        if (temp[item._id] && temp[item._id].left != item.top) {
                            item_left = temp[item._id].left;
                        }


                        diff_x = Math.abs(item_top - another.top);
                        diff_y = Math.abs(item_left - another.left);
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
                if (how == 10) {
                    how = -1;
                }
                how++;
            }).run();


        }, 15);
    }
);