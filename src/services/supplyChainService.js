const db = require("../config/db");
const crypto = require("crypto");
const { contract } = require("../config/blockchain");

exports.addStage = async ({ product_id, stage, data, tx_hash }) => {
    let normalizedData = data;
    if (typeof normalizedData === "string") {
        try {
            normalizedData = JSON.parse(normalizedData);
        } catch {
            normalizedData = { details: normalizedData };
        }
    }

    if (!normalizedData || typeof normalizedData !== "object" || Array.isArray(normalizedData)) {
        normalizedData = { details: String(normalizedData ?? "") };
    }

    if (tx_hash) {
        normalizedData.tx_hash = tx_hash;
    }

    const [result] = await db.execute(
        "INSERT INTO supply_chain (product_id, stage, data) VALUES (?, ?, ?)",
        [product_id, stage, JSON.stringify(normalizedData)]
    );

    const [rows] = await db.execute("SELECT * FROM supply_chain WHERE id = ?", [result.insertId]);
    return rows[0] || null;
};

exports.generateHash = async (productId) => {
    const [products] = await db.execute("SELECT id, name, origin FROM products WHERE id = ?", [productId]);
    if (products.length === 0) {
        return null;
    }

    // Lấy lịch sử chuỗi cung ứng trực tiếp từ Smart Contract
    const history = await contract.getHistory(productId);

    const dataToHash = JSON.stringify({
        product: products[0],
        history: history.map((item) => ({
            stageName: item.stageName,
            note: item.note,
            updatedBy: item.updatedBy,
            timestamp: Number(item.timestamp),
        })),
    });

    const hash = "0x" + crypto.createHash("sha256").update(dataToHash).digest("hex");

    return {
        productId,
        hash,
        data_preview: dataToHash,
    };
};

exports.saveBlockchainRecord = async ({ product_id, hash, tx_hash }) => {
    const [existingRecords] = await db.execute(
        "SELECT id FROM blockchain_records WHERE product_id = ? ORDER BY id DESC LIMIT 1",
        [product_id]
    );

    let recordId;
    if (existingRecords.length > 0) {
        await db.execute(
            "UPDATE blockchain_records SET hash = ?, tx_hash = ? WHERE id = ?",
            [hash, tx_hash, existingRecords[0].id]
        );
        recordId = existingRecords[0].id;
    } else {
        const [result] = await db.execute(
            "INSERT INTO blockchain_records (product_id, hash, tx_hash) VALUES (?, ?, ?)",
            [product_id, hash, tx_hash]
        );
        recordId = result.insertId;
    }

    const [rows] = await db.execute("SELECT * FROM blockchain_records WHERE id = ?", [recordId]);
    return rows[0] || null;
};

exports.getBlockchainRecord = async (productId) => {
    // Lấy thông tin sản phẩm từ DB (để tính hash)
    const [products] = await db.execute("SELECT id, name, origin FROM products WHERE id = ?", [productId]);
    if (products.length === 0) {
        return { notFound: true };
    }

    try {
        // Lấy lịch sử chuỗi cung ứng trực tiếp từ Smart Contract
        const history = await contract.getHistory(productId);

        // Nếu chưa có dữ liệu trên Blockchain thì fallback về DB
        if (history.length === 0) {
            const [records] = await db.execute(
                "SELECT hash, tx_hash FROM blockchain_records WHERE product_id = ? ORDER BY id DESC LIMIT 1",
                [productId]
            );
            return { data: records[0] || null };
        }

        // Tính hash tổng hợp từ dữ liệu trên Blockchain
        const dataToHash = JSON.stringify({
            product: products[0],
            history: history.map((item) => ({
                stageName: item.stageName,
                note: item.note,
                updatedBy: item.updatedBy,
                timestamp: Number(item.timestamp),
            })),
        });

        const hash = "0x" + crypto.createHash("sha256").update(dataToHash).digest("hex");

        // Lấy tx_hash của giao dịch gần nhất từ sự kiện StageAdded trên Blockchain
        let txHash = "";
        try {
            const filter = contract.filters.StageAdded(productId);
            const events = await contract.queryFilter(filter, 0, "latest");
            if (events.length > 0) {
                txHash = events[events.length - 1].transactionHash;
            }
        } catch (eventError) {
            console.error("Lỗi lấy tx_hash từ sự kiện StageAdded:", eventError.message);
        }

        return {
            data: {
                hash,
                tx_hash: txHash,
            },
        };
    } catch (blockchainError) {
        // Nếu kết nối Blockchain thất bại, fallback về dữ liệu DB
        console.error("Lỗi kết nối Blockchain:", blockchainError.message);
        const [records] = await db.execute(
            "SELECT hash, tx_hash FROM blockchain_records WHERE product_id = ? ORDER BY id DESC LIMIT 1",
            [productId]
        );
        return { data: records[0] || null };
    }
};

exports.getHistory = async (productId) => {
    try {
        // Gọi hàm getHistory của Smart Contract để lấy dữ liệu từ Blockchain
        const history = await contract.getHistory(productId);

        // Lấy danh sách sự kiện StageAdded để map tx_hash cho từng công đoạn
        let txHashes = [];
        try {
            const filter = contract.filters.StageAdded(productId);
            const events = await contract.queryFilter(filter, 0, "latest");
            txHashes = events.map((event) => event.transactionHash);
        } catch (eventError) {
            console.error("Lỗi lấy sự kiện StageAdded:", eventError.message);
        }

        // Format dữ liệu từ Blockchain về định dạng tương thích với frontend
        const stages = history.map((item, index) => {
            let parsedData;
            try {
                parsedData = JSON.parse(item.note);
            } catch {
                parsedData = { details: item.note };
            }

            // Gắn tx_hash và updatedBy của từng công đoạn vào data để frontend hiển thị
            const txHash = txHashes[index] || "";
            if (txHash) {
                parsedData.tx_hash = txHash;
            }
            if (item.updatedBy) {
                parsedData.updatedBy = item.updatedBy;
            }

            return {
                stage: item.stageName,
                data: JSON.stringify(parsedData),
                created_at: new Date(Number(item.timestamp) * 1000).toISOString(),
            };
        });

        return stages;
    } catch (blockchainError) {
        // Nếu kết nối Blockchain thất bại, fallback về dữ liệu DB
        console.error("Lỗi kết nối Blockchain:", blockchainError.message);
        const [stages] = await db.execute(
            "SELECT stage, data, created_at FROM supply_chain WHERE product_id = ? ORDER BY created_at ASC",
            [productId]
        );
        return stages;
    }
};

