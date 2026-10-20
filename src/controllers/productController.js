const productService = require("../services/productService");

exports.getAllProducts = async (req, res) => {
    try {
        const products = await productService.getAllProducts();
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createProduct = async (req, res) => {
    const { name, price, image, description, origin, stock, status = 1 } = req.body;
    try {
        if (!name || Number(price) <= 0 || Number(stock) < 0) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đúng thông tin sản phẩm!" });
        }

        const newProduct = await productService.createProduct({
            name,
            price,
            image,
            description,
            origin,
            stock,
            status,
        });

        res.json({
            success: true,
            message: "Thêm sản phẩm thành công!",
            data: newProduct,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productService.getProductById(id);

        if (!product) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }
        res.json({ success: true, data: product });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, price, description, image, origin, stock, status } = req.body;
    try {
        if (!name || Number(price) <= 0 || Number(stock) < 0 || ![0, 1].includes(Number(status))) {
            return res.status(400).json({ success: false, message: "Vui lòng nhập đúng thông tin sản phẩm!" });
        }

        const updatedProduct = await productService.updateProduct(id, {
            name,
            price,
            description,
            image,
            origin,
            stock,
            status,
        });

        if (!updatedProduct) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });
        }

        res.json({
            success: true,
            message: "Cập nhật sản phẩm thành công!",
            data: updatedProduct,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await productService.deleteProduct(id);
        res.json({
            success: true,
            message: "Xóa sản phẩm thành công!",
            data: deletedProduct,
        });
    } catch (error) {
        if (error.statusCode) {
            return res.status(error.statusCode).json({ success: false, message: error.message });
        }
        if (error.errno === 1451 || error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(409).json({
                success: false,
                message: "Không thể xóa sản phẩm vì đang được tham chiếu bởi dữ liệu khác.",
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.activateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { stock } = req.body;

        if (!stock || stock <= 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng cung cấp số lượng thành phần lớn hơn 0 để kích hoạt sản phẩm!",
            });
        }

        const activatedProduct = await productService.activateProduct(id, stock);
        if (!activatedProduct) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm!" });
        }

        res.json({
            success: true,
            message: "Sản phẩm đã được kích hoạt!",
            data: activatedProduct,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getPublicProducts = async (req, res) => {
    try {
        const products = await productService.getPublicProducts();
        res.json({ success: true, data: products });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
