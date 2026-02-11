const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");

const generateQR = async (pass) => {
  const token = jwt.sign(
    {
      passId: pass._id,
      userId: pass.user,
      expiry: Math.floor(new Date(pass.validTill).getTime() / 1000),
    },
    process.env.JWT_SECRET,
  );
  const qrImage = await QRCode.toDataURL(token);
  return { token, qrImage };
};

module.exports = { generateQR };
