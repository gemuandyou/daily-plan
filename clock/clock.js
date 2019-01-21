(function () {

    var clock = {
        settings: {
            lineWidth: 10, // 时钟圆的线条粗度
            lineColor: '#ccc', // 时钟圆的线条颜色
            showDigital: true, // 是否显示数字时间
            /**
             * 时间点列表。会在时钟上特殊显示时间点，格式有两种：
             *      1. [小时].[分钟]。时间信息在settings.eventList中
             *      2. {time: [小时].[分钟], 'event': ''}
             */
            // timePoints: [{time: 08.01, 'event': 'birthday'}, {time: 10.16}],
            timePoints: [08.01, 10.16],
            events: ['birthday', 'xxx'] // 时间点列表对应的时间点的事件信息列表。
        },

        eventQueue: {},

        eventPosition: {
            x: -1,
            y: -1,
            hoverX: -1,
            hoverY: -1
        },

        draw: (element, options) => {
            var settings = clock.settings;
            var eventPosition = clock.eventPosition;

            for (var prop in options) {
                if (settings.hasOwnProperty(prop)) {
                    settings[prop] = options[prop];
                }
            }

            if (element && element instanceof HTMLCanvasElement) {
                element.addEventListener('click', (event) => {
                    eventPosition.x = event.offsetX;
                    eventPosition.y = event.offsetY;
                    element.style.cursor = 'default';
                });
                element.addEventListener('mousemove', (event) => {
                    eventPosition.hoverX = event.offsetX;
                    eventPosition.hoverY = event.offsetY;
                    element.style.cursor = 'default';
                });
            } else {
                console.error('对不起啊，这个需要指定Canvas DOM元素的')
                return;
            }

            var clockEle = element;
            var ctx = clockEle.getContext('2d');

            var width = clockEle.getAttribute('width');
            var height = clockEle.getAttribute('height');
            var circleSize = width > height ? height / 2 : width / 2;

            function timeRollOn() {
                ctx.clearRect(0, 0, width, height);

                var now = new Date();
                hour = now.getHours();
                minute = now.getMinutes();
                second = now.getSeconds();
                millSecond = now.getMilliseconds();

                drawCircle();
                drawScale();
                drawTimePoint(hour, minute);

                getHands(ctx, hour, minute, second, millSecond);

                // 显示数字时间
                if (settings.showDigital) {
                    ctx.save();
                    ctx.translate(circleSize, circleSize);
                    ctx.beginPath();
                    var fontSize = circleSize / 12.5 > 10 ? circleSize / 12.5 : 11;
                    ctx.font = fontSize + 'px Microsoft Yahei';
                    ctx.strokeStyle = '#E2E2E2';
                    ctx.strokeText((hour < 10 ? '0' + hour : hour) + ':' + (minute < 10 ? '0' + minute : minute) + ':' + 
                                   (second < 10 ? '0' + second : second), -fontSize * 2, -circleSize * 0.5);
                    ctx.closePath();
                    ctx.restore();
                }
            }

            /**
             * 画圆
             */
            function drawCircle() {
                ctx.save();
                ctx.beginPath();
                ctx.lineWidth = settings.lineWidth;
                ctx.strokeStyle = settings.lineColor;
                ctx.arc(circleSize, circleSize, circleSize - settings.lineWidth, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.fillStyle = '#58585887';
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            }

            /**
             * 画刻度
             */
            function drawScale() {
                for (var i = 0; i < 60; i++) {
                    ctx.save();
                    ctx.translate(circleSize, circleSize); // 重置画布上的坐标原点为圆的中心
                    ctx.beginPath();
                    ctx.rotate(i * 6 * Math.PI / 180); // 旋转 i*6 个弧度，公式为：degrees*Math.PI/180

                    if (i % 5 === 0) {
                        ctx.fillStyle = '#e0bdbd';
                        ctx.arc(0, -1 * (circleSize - 3 / 2 * settings.lineWidth - circleSize / 35 * 2), circleSize / 35, 0, 2 * Math.PI);
                        ctx.fill();
                    } else {
                        ctx.lineWidth = 3;
                        ctx.strokeStyle = '#000';
                        ctx.moveTo(0, -1 * (circleSize - 3 / 2 * settings.lineWidth) + circleSize / 10);
                        ctx.lineTo(0, -1 * (circleSize - 3 / 2 * settings.lineWidth) + circleSize / 25);
                        ctx.stroke();
                    }

                    ctx.closePath();
                    ctx.restore();
                }

                // 画刻度数值
                for (var i = 1; i <= 12; i++) {
                    ctx.save();
                    ctx.translate(circleSize, circleSize + circleSize / 50); // 重置画布上的坐标原点为圆的中心
                    ctx.beginPath();

                    // 计算刻度相对于圆心所在坐标
                    var val = (circleSize - 3 / 2 * settings.lineWidth - circleSize / 35 * 5) / Math.sin(Math.PI / 2);
                    var x = val * Math.sin(i * 30 * Math.PI / 180);
                    var y = val * Math.sin((90 - i * 30) * Math.PI / 180);

                    var fontSize = circleSize / 12.5 > 10 ? circleSize / 12.5 : 11;
                    var gradient = ctx.createRadialGradient(0, 0 - circleSize / 50, val - fontSize, 0, 0 - circleSize / 50, val);
                    gradient.addColorStop('0', '#d8d8d8');
                    gradient.addColorStop('0.5', '#bd9898');
                    gradient.addColorStop('1.0', '#e8e8e8');
                    // 设置文字渐变
                    ctx.fillStyle = gradient;
                    ctx.font = fontSize + 'px Georgia';

                    ctx.fillText(i, x - (i > 9 ? fontSize / 2 : fontSize / 4), -y);

                    ctx.closePath();
                    ctx.restore();
                }
            }

            /**
             * 画时钟指针
             * @param {CanvasRenderingContext2D} ctx 
             * @param {Number} hour 
             * @param {Number} minute 
             * @param {Number} second 
             * @param {Number} millSecond 
             */
            function getHands(ctx, hour, minute, second, millSecond) {
                // 秒针
                ctx.save();
                ctx.translate(circleSize, circleSize);
                ctx.beginPath();
                ctx.rotate(-Math.PI / 2);
                ctx.lineWidth = 8;
                ctx.strokeStyle = '#d4d4d4';
                if (millSecond) {
                    var millSecondAngle = (second * 1000 + millSecond) / 60000 * 360;
                    ctx.arc(0, 0, circleSize - 76, (millSecondAngle - 6) / 180 * Math.PI, millSecondAngle / 180 * Math.PI);
                } else {
                    var secondAngle = second / 60 * 360;
                    ctx.arc(0, 0, circleSize - 76, (secondAngle - 6) / 180 * Math.PI < 0 ? 0 : (secondAngle - 6) / 180 * Math.PI, secondAngle / 180 * Math.PI);
                }
                ctx.stroke();
                ctx.closePath();
                ctx.restore();

                // 分针
                ctx.save();
                ctx.translate(circleSize, circleSize);
                ctx.beginPath();
                ctx.rotate(-Math.PI / 2);
                ctx.lineWidth = 8;
                ctx.strokeStyle = '#aaa';
                var minuteAngle = minute / 60 * 360 + second / 60 * 6;
                ctx.arc(0, 0, circleSize - 90, 0, minuteAngle / 180 * Math.PI);
                ctx.globalCompositeOperation="destination-over";
                ctx.stroke();
                // 分针背景
                ctx.beginPath();
                ctx.lineWidth = 8;
                ctx.strokeStyle = '#e0e0e088';
                ctx.arc(0, 0, circleSize - 90, 0, 2 * Math.PI);
                ctx.globalCompositeOperation="destination-over";
                ctx.stroke();
                ctx.closePath();
                ctx.restore();
                
                // 时针
                ctx.save();
                ctx.translate(circleSize, circleSize);
                ctx.beginPath();
                ctx.rotate(-Math.PI / 2);
                ctx.moveTo(0, 0);
                var hourAngle = hour % 12 * 30 + minute / 60 * 30;
                ctx.globalCompositeOperation="destination-over";
                ctx.lineTo(0, 0);
                ctx.fillStyle = '#bbb';
                if (hour >= 12) { // 已经下午了
                    ctx.arc(0, 0, circleSize - 160, 0, 2 * Math.PI);
                    ctx.fill();
                    ctx.arc(0, 0, circleSize - 100, 0, hourAngle / 180 * Math.PI);
                } else { // 还是上午
                    ctx.arc(0, 0, circleSize - 160, 0, hourAngle / 180 * Math.PI);
                }
                ctx.fill();
                // 时针背景
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.arc(0, 0, circleSize - 100, 0, 2 * Math.PI);
                ctx.globalCompositeOperation="destination-over";
                ctx.lineTo(0, 0);
                ctx.fillStyle = '#e0e0e066';
                ctx.fill();
                ctx.closePath();
                ctx.restore();
            }

            /**
             * 画时间点
             * @param {Number} hour 小时
             * @param {Number} minute 分钟
             */
            function drawTimePoint(hour, minute) {
                for (var i = 0; i < settings.timePoints.length; i++) {
                    var timePoint = settings.timePoints[i];

                    if (timePoint.time) {
                        var time = timePoint.time;
                        var event = timePoint.event;
                    } else {
                        time = timePoint;
                        event = settings.events[i];
                    }

                    var hourPoint = Math.floor(time);
                    var minutePoint = Math.round((time - hourPoint) * 100);

                    // 在当前小时内的时间点会在分针上显示
                    if (hourPoint === hour) {
                        // 分钟时间点
                        ctx.save();
                        ctx.translate(circleSize, circleSize);
                        ctx.beginPath();
                        ctx.fillStyle = minutePoint <= minute ? 'black' : 'white';
                        var minuteAngle = minutePoint / 60 * 360;
                        var val = (circleSize - 90) / Math.sin(Math.PI / 2);
                        var minuteX = val * Math.sin(minuteAngle / 180 * Math.PI);
                        var minuteY = val * Math.sin((90 - minuteAngle) / 180 * Math.PI);
                        ctx.arc(minuteX, -minuteY, 4, 0, 2 * Math.PI);
                        ctx.globalCompositeOperation="source-over";
                        ctx.fill();
                        if (ctx.isPointInPath(eventPosition.x, eventPosition.y)) {
                            clock.emit('clickTime', time);
                        }
                        if (ctx.isPointInPath(eventPosition.hoverX, eventPosition.hoverY)) {
                            // 鼠标悬停
                            ctx.arc(minuteX, -minuteY, 6, 0, 2 * Math.PI);
                            ctx.fill();
                            ctx.closePath();
                            ctx.beginPath();
                            ctx.fillStyle = '#ffef20';
                            ctx.font = '13px Microsoft Yahei';
                            ctx.fillText(event, minuteX - ctx.measureText(event).width / 2, -minuteY - 20);
                            ctx.fill();
                            ctx.closePath();
                            element.style.cursor = 'pointer';
                        }
                        ctx.closePath();
                        ctx.restore();
                    }

                    // 时针时间点
                    ctx.save();
                    ctx.translate(circleSize, circleSize);
                    ctx.beginPath();
                    var fillColor = 'white';
                    // 当前时间已经超过时间点
                    if (hourPoint < hour) {
                        fillColor = 'black';
                    } else if (hourPoint === hour && minutePoint <= minute) {
                        fillColor = 'black';
                    }

                    ctx.fillStyle = fillColor;
                    var hourAngle = hourPoint % 12 * 30 + minutePoint / 60 * 30;
                    if (hourPoint >= 12) {
                        val = (circleSize - 120) / Math.sin(Math.PI / 2);
                    } else {
                        val = (circleSize - 180) / Math.sin(Math.PI / 2);
                    }
                    var hourX = val * Math.sin(hourAngle / 180 * Math.PI);
                    var hourY = val * Math.sin((90 - hourAngle) / 180 * Math.PI);
                    ctx.globalCompositeOperation="source-over";
                    ctx.arc(hourX, -hourY, 5.5, 0, 2 * Math.PI);
                    ctx.fill();
                    if (ctx.isPointInPath(eventPosition.x, eventPosition.y)) {
                        clock.emit('clickTime', time);
                    }
                    if (ctx.isPointInPath(eventPosition.hoverX, eventPosition.hoverY)) {
                        // 鼠标悬停
                        ctx.arc(hourX, -hourY, 7, 0, 2 * Math.PI);
                        ctx.fill();
                        ctx.closePath();
                        ctx.beginPath();
                        ctx.fillStyle = '#FEFEFE';
                        ctx.font = '13px Microsoft Yahei';
                        if (event) {
                          var row = 0;
                          var lines = event.split('\n');
                          for (var line of lines) {
                            var textWidth = ctx.measureText(event).width;
                            var skipRow = lines.length - row;
                            skipRow = skipRow > 1 ? skipRow : 1;
                            var offset = row == lines.length ? 0 : skipRow * 7;
                            ctx.fillText(line, hourX - ctx.measureText(textWidth).width / 2, skipRow * (-hourY - 20) - offset);
                            row++;
                          }
                        }
                        ctx.fill();
                        ctx.closePath();
                        element.style.cursor = 'pointer';
                    }
                    ctx.closePath();
                    ctx.restore();
                };
                
                eventPosition.x = -1;
                eventPosition.y = -1;
            }

            timeRollOn();
            setInterval(timeRollOn, 10);
        },

        on: function(eventName, handle) {
            if (!clock.eventQueue[eventName]) {
                clock.eventQueue[eventName] = [];
            }
            clock.eventQueue[eventName].push(handle);
        },

        emit: function(eventName, ...params) {
            clock.eventQueue[eventName].forEach(event => {
                event.apply(null, params);
            });
        }

    }

    window.Clock = clock;

}());