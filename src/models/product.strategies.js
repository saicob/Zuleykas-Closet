class ProductStrategy {
    extractFields(data) {
        throw new Error("extractFields() debe ser implementado.");
    }
    
    getTallasArray(data) {
        return [];
    }
}

class ClothingStrategy extends ProductStrategy {
    extractFields(data) {
        return {
            material: data.material_ropa || null,
            color: data.color_ropa || null,
            tallas: data.tallas_ropa || null,
            composicion: data.composicion_ropa || null,
            tipo_ajuste: data.ajuste_ropa || null,
            fecha_fabricacion: data.fecha_fabricacion || null,
            fecha_caducidad: data.fecha_caducidad || null,
        };
    }
    
    getTallasArray(data) {
        if (data.tallas_ropa) {
            return [...new Set(data.tallas_ropa.split(",").map((t) => t.trim()).filter(Boolean))];
        }
        return [];
    }
}

class CosmeticStrategy extends ProductStrategy {
    extractFields(data) {
        return {
            textura: data.textura_cosmetico || null,
            tipo: data.tipo_cosmetico || null,
            color: data.color_cosmetico || null,
            acabado: data.acabado_cosmetico || null,
            fecha_fabricacion: data.fecha_fabricacion_cosmetico || null,
            fecha_caducidad: data.fecha_caducidad_cosmetico || null,
        };
    }
    
    getTallasArray(data) {
        return [];
    }
}

class AccessoryStrategy extends ProductStrategy {
    extractFields(data) {
        return {
            material: data.material_accesorio || null,
            color: data.color_accesorio || null,
            tallas: data.tallas_accesorio || null,
            fecha_fabricacion: data.fecha_fabricacion || null,
            fecha_caducidad: data.fecha_caducidad || null,
        };
    }
    
    getTallasArray(data) {
        if (data.tallas_accesorio) {
            return data.tallas_accesorio.split(",").map((t) => t.trim()).filter(Boolean);
        }
        return [];
    }
}

class DefaultStrategy extends ProductStrategy {
    extractFields(data) {
        return {
            fecha_fabricacion: data.fecha_fabricacion || null,
            fecha_caducidad: data.fecha_caducidad || null,
        };
    }
    
    getTallasArray(data) {
        return [];
    }
}

class ProductStrategyRegistry {
    constructor() {
        this.strategies = new Map();
    }
    
    register(category, strategy) {
        this.strategies.set(category, strategy);
    }
    
    getStrategy(category) {
        if (this.strategies.has(category)) {
            return this.strategies.get(category);
        }
        return new DefaultStrategy();
    }
}

// Singleton registry exportado
const strategyRegistry = new ProductStrategyRegistry();
strategyRegistry.register("Ropa", new ClothingStrategy());
strategyRegistry.register("Cosmetico", new CosmeticStrategy());
strategyRegistry.register("Accesorio", new AccessoryStrategy());

export { strategyRegistry, ProductStrategy, ClothingStrategy, CosmeticStrategy, AccessoryStrategy, DefaultStrategy };
