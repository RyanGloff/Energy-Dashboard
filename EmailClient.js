const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'gloffenergymonitorapp',
        pass: 'scab duwl pxop kxiy'
    }
});

function sendEmail(address, title, message) {
    const mailOptions = {
        from: 'gloffenergymonitorapp@gmail.com',
        to: address,
        subject: title,
        text: message
    };

    transport.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.log(err);
        } else {
            console.log(`Email send: ${info.response}`);
        }
    })
}

module.exports = {
    sendEmail
};