const supplyChainService = require("../services/supplyChainService");

// ==================== SUPPLY CHAIN ====================
// Thêm công đoạn vào chuỗi cung ứng
exports.addStage = async (req, res) => {
    try {
        const { product_id, stage, data, tx_hash } = req.body;

        const newStage = await supplyChainService.addStage({ product_id, stage, data, tx_hash });
        res.status(201).json({
            success: true,
            message: `Đã cập nhật công đoạn: ${stage}`,
            data: newStage,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

//==================== BLOCKCHAIN ====================
// Tạo mã Hash cho sản phẩm và lịch sử chuỗi cung ứng (lấy dữ liệu từ Blockchain)
exports.generateHash = async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await supplyChainService.generateHash(productId);
        if (!result) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        res.json({
            success: true,
            message: "Tạo mã Hash thành công",
            productId: result.productId,
            hash: result.hash,
            data_preview: result.data_preview,
            data: result,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lưu bằng chứng Blockchain vào cơ sở dữ liệu
exports.saveBlockchainRecord = async (req, res) => {
    try {
        const { product_id, hash, tx_hash } = req.body;

        const record = await supplyChainService.saveBlockchainRecord({ product_id, hash, tx_hash });

        res.status(201).json({
            success: true,
            message: "Đã lưu bằng chứng Blockchain vào hệ thống!",
            data: record,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy thông tin bằng chứng Blockchain cho sản phẩm (truy xuất trực tiếp từ Blockchain)
exports.getBlockchainRecord = async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await supplyChainService.getBlockchainRecord(productId);
        if (result.notFound) {
            return res.status(404).json({ success: false, message: "Không tìm thấy sản phẩm" });
        }

        res.json({
            success: true,
            data: result.data,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Lấy lịch sử chuỗi cung ứng cho sản phẩm (truy xuất trực tiếp từ Blockchain)
exports.getHistory = async (req, res) => {
    try {
        const { productId } = req.params;

        const stages = await supplyChainService.getHistory(productId);
        res.json({ success: true, data: stages });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
