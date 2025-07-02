const prisma = require("../config/prisma")
const cloudinary = require('cloudinary').v2;


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})


exports.create = async (req, res) => {
    try {
        const { title, description, price, quantity, images, categoryId } = req.body
        // console.log(title,description,price,quantity,images)
        const product = await prisma.product.create({
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseFloat(categoryId),
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url,
                    }))
                }
            }
        })
        res.send(product)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })

    }
}

exports.list = async (req, res) => {
    try {
        const count = parseInt(req.params.count) || 10; // ✅ parse และ default 10 ถ้าไม่ได้ส่งมา
        const products = await prisma.product.findMany({
            take: count,
            orderBy: { createdAt: "desc" },
            include: {
                category: true,
                images: true
            }
        });

        res.json(products); // ✅ ส่ง JSON API มาตรฐาน
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Server error" });
    }
};



exports.read = async (req, res) => {
    try {
        const { id } = req.params
        const products = await prisma.product.findFirst({
            where: {
                id: Number(id),

            },
            include: {
                category: true,
                images: true
            }
        })

        res.send(products)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}

exports.update = async (req, res) => {
    try {
        const { title, description, price, quantity, images, categoryId } = req.body
        // console.log(title,description,price,quantity,images)
        const image = await prisma.image.deleteMany({
            where: {
                productId: Number(req.params.id)
            }
        })
        const { id } = req.params
        const product = await prisma.product.update({
            where: {
                id: Number(id)
            },
            data: {
                title: title,
                description: description,
                price: parseFloat(price),
                quantity: parseInt(quantity),
                categoryId: parseFloat(categoryId),
                images: {
                    create: images.map((item) => ({
                        asset_id: item.asset_id,
                        public_id: item.public_id,
                        url: item.url,
                        secure_url: item.secure_url,
                    }))
                }
            }
        })
        res.send(product)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}



exports.remove = async (req, res) => {
    try {
        const { id } = req.params
        //ลบในclound
        const product = await prisma.product.findFirst({
            where: {
                id: Number(id)
            }, include: { images: true }
        })
        if (!product) {
            return res.status(400).json({ message: " product not found!!" })

        }
        console.log(product);

        const deleteImage = product.images.map((item, index) => new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(item.public_id, (err, result) => {
                if (err) reject(err)
                else resolve(result)

            })
        }))
        await Promise.all(deleteImage)


        await prisma.product.delete({
            where: {
                id: Number(id)
            }
        })
        res.send("remove product")
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}


exports.listBy = async (req, res) => {
    try {
        const { sort, order, limit } = req.body
        const products = await prisma.product.findMany({
            take: limit,
            orderBy: { [sort]: order },
            include: {
                category: true,
                images: true
            }
        })
        console.log(sort, order, limit)
        res.send(products)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}


const handleQuery = async (req, res, query) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                title: {
                    contains: query,
                }
            }, include: {
                category: true,
                images: true
            }

        })
        res.send(products)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "serch error" })
    }
}

const handleCategory = async (req, res, categoryId) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                categoryId: {
                    in: categoryId.map((id) => Number(id))
                }
            }, include: {
                category: true,
                images: true
            }

        })
        res.send(products)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "error" })
    }
}

const handlePrice = async (req, res, priceRange) => {
    try {
        const products = await prisma.product.findMany({
            where: {
                price: {
                    gte: priceRange[0],   //gteคือมากกว่า
                    lte: priceRange[1]   //lteคือน้อยกว่า
                }
            }, include: {
                category: true,
                images: true
            }

        })
        res.send(products)


    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "serch 1error" })
    }
}


exports.search = async (req, res) => {
    try {
        const { query, category, price } = req.body
        if (query) {
            console.log("query", query)
            await handleQuery(req, res, query)
        }

        if (category) {
            console.log("category", category)
            await handleCategory(req, res, category)

        }

        if (price) {
            console.log("price", price)
            await handlePrice(req, res, price)
        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}






exports.images = async (req, res) => {
    try {
        const result = await cloudinary.uploader.upload(req.body.image, {
            public_id: `AA-${Date.now()}`,
            resource_type: 'auto',
            folder: 'EcomProject'
        })
        res.send(result)
    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}


exports.removeImages = async (req, res) => {
    try {

        const { public_id } = req.body
        // console.log(public_id);

        cloudinary.uploader.destroy(public_id, (result) => {
            res.send('Delete image Sucess!!!')
        })

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "Sever error" })
    }
}