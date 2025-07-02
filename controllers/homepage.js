const prisma = require('../config/prisma')
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ อัปโหลดรูปภาพจาก base64
exports.uploadHomeImage = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `home-${Date.now()}`,
      resource_type: 'auto',
      folder: 'ecom-home-images',
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'อัปโหลดรูปไม่สำเร็จ' });
  }
};

// ✅ GET: ดึงรูปทั้งหมดหรือเฉพาะที่เป็น featured
exports.getHomeImages = async (req, res) => {
  try {
    const isFeatured = req.query.featured === 'true';
    const images = await prisma.homeImage.findMany({
      where: isFeatured ? { is_featured: true } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    res.json(images);
  } catch (error) {
    console.error('❌ Error fetching images:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงรูปภาพ' });
  }
};

// ✅ POST: เพิ่มรูปใหม่
exports.createHomeImage = async (req, res) => {
  try {
    const { title, image } = req.body;

    if (!title || !image) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อและรูปภาพ' });
    }

    const result = await cloudinary.uploader.upload(image, {
      folder: 'ecom-home-images',
    });

    const newImage = await prisma.homeImage.create({
      data: {
        title,
        asset_id: result.asset_id,
        public_id: result.public_id,
        url: result.url,
        secure_url: result.secure_url,
        is_featured: false, // default
      },
    });

    res.json(newImage);

  } catch (err) {
    console.error('❌ Error creating image:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// ✅ DELETE: ลบรูปตาม ID
exports.deleteHomeImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await prisma.homeImage.findUnique({
      where: { id: Number(id) },
    });

    if (!image) return res.status(404).json({ message: 'ไม่พบรูปภาพนี้' });

    res.send({ message: 'ลบเรียบร้อยแล้ว' });

    cloudinary.uploader.destroy(image.public_id, (err, result) => {
      if (err) console.error('ลบจาก Cloudinary ไม่สำเร็จ', err);
      else console.log('ลบจาก Cloudinary สำเร็จ', result);
    });

    await prisma.homeImage.delete({
      where: { id: Number(id) },
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในการลบรูป' });
  }
};

// ✅ PUT: แก้ไขข้อมูลรูป (ชื่อหรือ URL)
exports.updateHomeImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, secure_url } = req.body;

    const updated = await prisma.homeImage.update({
      where: { id },
      data: { title, secure_url },
    });

    res.json(updated);
  } catch (error) {
    console.error('❌ Error updating image:', error);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตรูปได้' });
  }
};

// ✅ GET: ดึงรูปภาพตาม ID
exports.getHomeImageById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const image = await prisma.homeImage.findUnique({ where: { id } });

    if (!image) {
      return res.status(404).json({ error: 'ไม่พบรูปภาพนี้' });
    }

    res.json(image);
  } catch (error) {
    console.error('❌ Error fetching image by ID:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลรูป' });
  }
};

// ✅ PATCH: toggle is_featured
exports.toggleFeaturedImage = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const image = await prisma.homeImage.findUnique({ where: { id } });

    if (!image) return res.status(404).json({ error: 'ไม่พบรูปภาพ' });

    const updated = await prisma.homeImage.update({
      where: { id },
      data: { is_featured: !image.is_featured },
    });

    res.json({ message: 'อัปเดตสถานะการแสดงผลแล้ว', is_featured: updated.is_featured });
  } catch (error) {
    console.error('❌ Error toggling featured:', error);
    res.status(500).json({ error: 'ไม่สามารถอัปเดตสถานะได้' });
  }
};
