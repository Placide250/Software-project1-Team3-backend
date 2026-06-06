exports.PAYMENT_METHODS = ["credit_card", "paypal", "google_pay", "apple_pay"];

exports.PAYMENT_STATUSES = ["processing", "complete", "failed", "cancelled"];

exports.ALLOWED_FREQUENCIES = ["daily", "weekly", "biweekly", "monthly"];

exports.MAX_SLOTS = 500; // only allow a reasonable number of slots

exports.TIME_VALIDATOR = /^([01]\d|2[0-3]):([0-5]\d)$/; // 24-hour HH:mm regex

exports.STANDARD_SEAT_COUNT = 75;
exports.WHEELCHAIR_SEAT_COUNT = 2;
