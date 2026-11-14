
CREATE TABLE IF NOT EXISTS capacidade_recursos (
    componente_id INT PRIMARY KEY,
    vcpus INT NOT NULL,
    memoria_total_gb DECIMAL(10,2) NOT NULL,
    armazenamento_total_gb DECIMAL(10,2) NOT NULL,

    CONSTRAINT fk_capacidade_componente
        FOREIGN KEY (componente_id)
        REFERENCES componente_infraestrutura(id)
        ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS tarifas_infraestrutura (
    id INT PRIMARY KEY AUTO_INCREMENT,
    custo_vcpu_hora DECIMAL(10,4) NOT NULL,
    custo_gb_ram_hora DECIMAL(10,4) NOT NULL,
    custo_gb_disco_mes DECIMAL(10,4) NOT NULL,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS custos_infraestrutura (
    id INT PRIMARY KEY AUTO_INCREMENT,
    componente_id INT NOT NULL,
    custo_cpu DECIMAL(12,2) NOT NULL,
    custo_ram DECIMAL(12,2) NOT NULL,
    custo_disco DECIMAL(12,2) NOT NULL,
    custo_total DECIMAL(12,2) NOT NULL,
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    calculado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_custo_componente
        FOREIGN KEY (componente_id)
        REFERENCES componente_infraestrutura(id)
        ON DELETE CASCADE
);
