(function () {

    function plans(element, plans) {

        var activeTime;

        var loadPlans = function () {
            var now = new Date();
            hour = now.getHours();
            minute = now.getMinutes();

            var plansHtml = '<ul class="plans-ul">';
            plans.forEach(plans => {
                var status = 'persent';
                var time = plans.time;
                var event = plans.event;

                var currentTime = parseFloat(hour + '.' + minute);
                if (time < currentTime) {
                    status = 'past';
                } else if (time > currentTime) {
                    status = 'future';
                }

                var hourPoint = Math.floor(time);
                var minutePoint = Math.round((time - hourPoint) * 100);

                plansHtml += '<li class="plans-li ' + status + ' ' + time +
                    ' ' + (time === activeTime ? 'active' : '') + '">';
                plansHtml += '<span class="plans-time">' + hourPoint + ':' + (minutePoint < 10 ? '0' : '') +
                    minutePoint + '</span>' + '<span class="plans-event">' + event + '</span>';
                plansHtml += '</li>';
            });
            plansHtml += '</ul>';
            element.innerHTML = plansHtml;
        }

        loadPlans();
        setInterval(loadPlans, 60000);

        /**
         * 高亮某个时间点
         * @param {Float} time 
         */
        this.__proto__.active = function (time) {
            activeTime = time;
            loadPlans();
        }
    }

    window.Plans = plans;
}());