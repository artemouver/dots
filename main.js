var w = document.documentElement.clientWidth;
var h = document.documentElement.clientHeight;

function windowSize() {
    $("canvas").attr({
        "width": "" + document.documentElement.clientWidth,
        "height": "" + document.documentElement.clientHeight
    });
    w = document.documentElement.clientWidth;
    h = document.documentElement.clientHeight;
}

$(window).on('load resize', windowSize);

function init() {
    console.info("initialized animation");
    var canvas = document.getElementById("game");
    var ctx = canvas.getContext("2d");

    var canW = canvas.width;
    var canH = canvas.height;

    var g = 1; //1
    var k = 5; //5
    var koef = 0.1;

    var showV = false;

    var whenLastFrame = currentTime();

    var bg = {
        x: 0,
        y: 0,
        w: canW,
        h: canH,
        fillStyle: "#FFFFFF"
    };

    var circles = [];
    var countFirstCircles = 15;
    var dist = w / (countFirstCircles - 2);
    for (var i = 0; i < countFirstCircles; i++) {
        circles[i] = {
            index: i,
            fill: "#000000",
            x: i * w / (countFirstCircles - 1),
            y: h * 0.85,
            radius: 10,
            first: true,
            vx: 0,
            vy: 0,
            ax: 0,
            ay: 0,
            neight: []
        };
        for (var j = 0; j < i; j++) {
            if (isLinked(circles[j], circles[i])) {
                var l = Math.sqrt(Math.pow(circles[i].x - circles[j].x, 2) + Math.pow(circles[i].y - circles[j].y, 2));
                circles[i].neight.push({circ: circles[j], len: l, index: j});
                circles[j].neight.push({circ: circles[i], len: l, index: i});
            }
        }
    }

    // var lines = [];
    // for (var i = 0; i < circles.length; i++)
    //     lines[i] = {j: [], len: []};
    // for (var i = 0; i < circles.length; i++) {
    //     for (var j = i + 1; j < circles.length; j++) {
    //         if (isLinked(circles[i], circles[j])) {
    //             var l = Math.sqrt(Math.pow(circles[i].x - circles[j].x, 2) + Math.pow(circles[i].y - circles[j].y, 2));
    //             lines[i].j.push(j);
    //             lines[j].j.push(i);
    //             lines[i].len.push(l);
    //             lines[j].len.push(l);
    //         }
    //     }
    // }

    var circleOnMouse = {
        fill: "#CCCCCC",
        x: -100,
        y: -100,
        radius: 10
    };

    canvas.addEventListener('mousemove', function (e) {
        circleOnMouse.x = e.offsetX;
        circleOnMouse.y = e.offsetY;
    });

    document.onkeydown = function (e) {
        if (e.keyCode === 38 && koef < 1)
            koef += 0.05;
        if (e.keyCode === 40 && koef > 0)
            koef -= 0.05;
        if (e.keyCode === 83)
            showV = !showV;
        koef = Math.round((koef)*100)/100;
        console.log(koef);
    };

    canvas.addEventListener('click', function (e) {
        var links = {
            count: 0,
            index: []
        };
        for (var i = 0; i < circles.length; i++)
            if (Math.sqrt(Math.pow(circles[i].x - e.offsetX, 2) + Math.pow(circles[i].y - e.offsetY, 2)) <= dist) {
                links.count++;
                links.index.push(i);
            }
        if (links.count >= 2) {
            i = circles.length;
            circles[i] = {
                index: i,
                fill: "#000000",
                x: e.offsetX,
                y: e.offsetY,
                radius: 10,
                first: false,
                vx: 0,
                vy: 0,
                neight: []
            };

            for (var q = 0; q < links.index.length; q++) {
                var j = links.index[q];
                var l = Math.sqrt(Math.pow(circles[i].x - circles[j].x, 2) + Math.pow(circles[i].y - circles[j].y, 2));
                circles[i].neight.push({circ: circles[j], len: l, index: j});
                circles[j].neight.push({circ: circles[i], len: l, index: i});
            }
            circles[i].ax = compulationA(i).x;
            circles[i].ay = compulationA(i).y;
        }
    });

    requestAnimationFrame(frame);

    function currentTime() {
        return new Date().getTime();
    }

    function frame() {
        requestAnimationFrame(frame);
        ctx.clearRect(0, 0, canW, canH);
        drawFrame();
        var now = currentTime();
        var passed = now - whenLastFrame;
        whenLastFrame = now;
        if (passed <= 100)
            for (var i = 0; i < 10; i++)
                move(passed / 10);
    }

    function drawFrame() {
        drawBackground();

        for (var i = 0; i < circles.length; i++) {
            if (isLinked(circles[i], circleOnMouse)) {
                ctx.beginPath();
                ctx.moveTo(circles[i].x, circles[i].y);
                ctx.lineTo(circleOnMouse.x, circleOnMouse.y);
                ctx.strokeStyle = circleOnMouse.fill;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }

        for (i = 0; i < circles.length; i++) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(circles[i].x, circles[i].y, circles[i].radius, 0, 2 * Math.PI);
            ctx.fillStyle = circles[i].fill;
            ctx.fill();
            ctx.restore();
        }

        for (i = 0; i < circles.length; i++) {
            for (var j = i; j < circles.length; j++) {
                if (isNeight(i, j)) {
                    ctx.beginPath();
                    ctx.moveTo(circles[i].x, circles[i].y);
                    ctx.lineTo(circles[j].x, circles[j].y);
                    ctx.strokeStyle = "#000000";
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }
            }
        }


        // ctx.save();
        // for (i = 0; i < circles.length; i++) {
        //     ctx.beginPath();
        //     ctx.moveTo(circles[i].x, circles[i].y);
        //     ctx.lineTo(circles[i].x + compulationA(i).x, circles[i].x + compulationA(i).y);
        //     ctx.strokeStyle = "green";
        //     ctx.lineWidth = 3;
        //     ctx.stroke();
        // }
        // ctx.restore();
        if (showV) {
            ctx.save();
            for (i = 0; i < circles.length; i++) {
                ctx.beginPath();
                ctx.moveTo(circles[i].x, circles[i].y);
                ctx.lineTo(circles[i].x + circles[i].vx, circles[i].x + circles[i].vy);
                ctx.strokeStyle = "green";
                ctx.lineWidth = 3;
                ctx.stroke();
            }
            ctx.restore();
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(circleOnMouse.x, circleOnMouse.y, circleOnMouse.radius, 0, 2 * Math.PI);
        ctx.fillStyle = circleOnMouse.fill;
        ctx.fill();
        ctx.restore();
    }

    function drawBackground() {
        ctx.save();
        ctx.fillStyle = bg.fillStyle;
        ctx.fillRect(bg.x, bg.y, bg.w, bg.h);
        ctx.restore();
    }

    function move(passed) {
        for (var i = 0; i < circles.length; i++) {
            if (!circles[i].first) {
                for (var j = 0; j < circles.length; j++) {
                    if (i !== j) {
                        if (!isNeight(i, j)) {
                            if (isLinked(circles[i], circles[j])) {
                                var l = Math.sqrt(Math.pow(circles[i].x - circles[j].x, 2) + Math.pow(circles[i].y - circles[j].y, 2));
                                circles[i].neight.push({circ: circles[j], len: l, index: j});
                                circles[j].neight.push({circ: circles[i], len: l, index: i});
                            }
                        }
                    }
                }

                circles[i].ax = compulationA(i).x;
                circles[i].ay = compulationA(i).y;

                circles[i].x += passed * circles[i].vx / 1000;
                circles[i].y += passed * circles[i].vy / 1000;

                circles[i].vx += passed * circles[i].ax;
                circles[i].vy += passed * circles[i].ay;
            }
        }
    }

    function isNeight(i, j) {
        for (var q = 0; q < circles[i].neight.length; q++) {
            if (circles[i].neight[q].index === j)
                return true;
        }
        return false;
    }

    function compulationA(i) {
        var m = circles[i].radius;
        var fx = compulationF(i, m).x;
        var fy = compulationF(i, m).y;
        return {x: fx / m, y: fy / m};
    }

    function compulationF(i, m) {
        var fGravity = {x: 0, y: m * g};
        var fFriction = {x: -circles[i].vx * koef, y: -circles[i].vy * koef};
        var fg = fGuk(i);
        return {x: fg.x + fGravity.x + fFriction.x, y: fg.y + fGravity.y + fFriction.y};
    }

    function fGuk(i) {
        var sumFGuk = summandsFGuk(i);
        return additionOfVectors(sumFGuk)
    }

    function additionOfVectors(arr) {
        var sum = {x: 0, y: 0};
        for (var i = 0; i < arr.length; i++) {
            sum.x += arr[i].x;
            sum.y += arr[i].y;
        }
        return sum;
    }

    function summandsFGuk(i) {
        var arrOfIndexesLinkedCircles = linkedCircles(i);
        var arr = [];
        for (var j = 0; j < arrOfIndexesLinkedCircles.length; j++) {
            var ind = arrOfIndexesLinkedCircles[j];
            var u = compulationU(i, ind);
            var dd = compulationDD(i, ind);
            arr.push({
                x: u.x * k * dd,
                y: u.y * k * dd
            });
        }
        return arr;
    }

    function compulationU(i, j) {
        var pj = {x: circles[j].x, y: circles[j].y};
        var pi = {x: circles[i].x, y: circles[i].y};
        var d = Math.sqrt(Math.pow(circles[i].x - circles[j].x, 2) + Math.pow(circles[i].y - circles[j].y, 2));
        return {x: (pj.x - pi.x) / d, y: (pj.y - pi.y) / d};
    }

    function compulationDD(i, j) {
        var d = Math.sqrt(Math.pow(circles[i].x - circles[j].x, 2) + Math.pow(circles[i].y - circles[j].y, 2));
        for (var q = 0; q < circles[i].neight.length; q++) {
            if (circles[i].neight[q].index === j)
                var l = circles[i].neight[q].len;
        }

        return d - l;
    }

    function isLinked(circleI, circleJ) {
        return Math.sqrt(Math.pow(circleI.x - circleJ.x, 2) + Math.pow(circleI.y - circleJ.y, 2)) <= dist;
    }

    function linkedCircles(i) {
        var arr = [];
        for (var j = 0; j < circles.length; j++)
            if (i !== j)
                if (isLinked(circles[i], circles[j]))
                    arr.push(j);
        return arr;
    }

}
