import json
import re
from pathlib import Path

NOMES = {
  "produto-1.jpg": "Vestido Midi Preto Gola Alta",
  "produto-2.jpg": "Camisa Off-White e Calça Bege com Pregas",
  "produto-3.jpg": "Vestido Tubinho Off-White sem Mangas",
  "produto-4.jpg": "Camisa Social Preta e Calça Off-White Alfaiataria",
  "produto-5.jpg": "Top Marrom Sem Mangas e Calça Off-White",
  "produto-6.jpg": "Colete Alfaiataria Off-White e Calça Bege",
  "produto-7.jpg": "Camisa Social Preta e Calça Alfaiataria Preta",
  "produto-8.jpg": "Camisa Social Azul Claro e Calça Bege com Pregas",
  "produto-9.jpg": "Vestido Midi Marrom Gola Alta",
  "produto-10.jpg": "Camisa Social Branca e Calça Preta Alfaiataria",
  "produto-11.jpg": "Vestido Midi Preto Sem Mangas Gola Alta",
  "produto-12.jpg": "Regata Branca e Calça Jeans Cintura Alta",
  "produto-13.jpg": "Camiseta Preta Básica e Calça Branca",
  "produto-14.jpg": "Conjunto Alfaiataria Bege Blazer Cropped e Calça Wide",
  "produto-15.jpg": "Vestido Longo Off-White com Alças Finas",
  "produto-16.jpg": "Camiseta Básica Preta Masculina",
  "produto-17.jpg": "Camisa Social Branca Slim Fit Masculina",
  "produto-18.jpg": "Camiseta Preta e Calça Chino Bege Masculina",
  "produto-19.jpg": "Camisa Polo Preta Masculina",
  "produto-20.jpg": "Jaqueta Jeans Azul e Camiseta Branca Masculina",
  "promo-1.jpg": "Corta-Vento Camuflado e Calça Cargo Bege Streetwear",
  "promo-2.jpg": "Regata NBA Preta e Saia Jeans Destroyed",
  "promo-3.jpg": "Jaqueta com Capuz Marrom e Calça Preta Outdoor",
  "promo-4.jpg": "Conjunto Agasalho Esportivo Azul com Listras",
  "promo-5.jpg": "Jaqueta Jeans Azul Clara e Top Tricô Bege",
  "promo-6.jpg": "Jaqueta Corta-Vento Preta e Bermuda Esportiva",
  "promo-7.jpg": "Moletom Bege com Estampa e Bermuda Ciclista Preta",
  "promo-8.jpg": "Camisa Flanela Xadrez Laranja e Jeans Destroyed",
  "promo-9.jpg": "Jaqueta Jeans Azul e Calça Pantalona Azul Marinho",
  "promo-10.jpg": "Corta-Vento Preta e Pochete Oliva Streetwear",
  "promo-11.jpg": "Camiseta Streetwear Estampada e Bermuda Azul",
  "casual-1.jpg": "Suéter Mostarda Feminino Tricô",
  "casual-2.jpg": "Camisa Flanela Xadrez Azul Marinho Masculina",
  "casual-3.jpg": "Moletom Cinza com Capuz e Jeans Escuro",
  "casual-4.jpg": "Camiseta Cinza e Bermuda Cargo Verde Oliva",
  "casual-5.jpg": "Moletom Verde Petróleo e Jeans Claro Masculino",
  "casual-6.jpg": "Cardigã Tricô Creme e Calça Cargo Oliva",
  "casual-7.jpg": "Jaqueta Jeans Azul Clara e Camiseta Estampada",
  "casual-8.jpg": "Camiseta Branca e Saia Floral Longa",
  "casual-9.jpg": "Camisa Flanela Xadrez Azul Vermelha Masculina",
  "casual-10.jpg": "Vestido Camiseiro Azul Marinho de Linho",
  "casual-11.jpg": "Suéter Bege e Calça Skinny Preta Feminina",
  "casual-12.jpg": "Camiseta Manga Longa Cinza e Calça Veludo Marrom",
  "casual-13.jpg": "Jaqueta Bomber Verde Oliva e Vestido Preto",
  "casual-14.jpg": "Camisa Polo Verde Oliva e Bermuda Bege Masculina",
  "casual-15.jpg": "Camiseta Grafite Estampada e Jeans Destroyed",
  "casual-16.jpg": "Camisa Verde Oliva e Calça Chino Bege Masculina",
  "casual-17.jpg": "Macacão Longo Preto Feminino",
  "casual-18.jpg": "Moletom Azul Marinho e Calça Jogger Cinza Masculino",
  "casual-19.jpg": "Moletom Rosa Oversized Feminino",
  "casual-20.jpg": "Jaqueta Jeans Azul e Camiseta Listrada Masculina",
  "casual-21.jpg": "Jaqueta Jeans Azul e Vestido Floral Curto",
  "casual-22.jpg": "Camisa Flanela Xadrez Vermelha e Jeans Escuro",
  "casual-23.jpg": "Regata Canelada Bege e Calça Verde Oliva",
  "casual-24.jpg": "Moletom Cinza Mescla e Bermuda Preta Masculina",
  "esportivo-1.jpg": "Moletom Cinza e Top Esportivo Azul com Legging Preta",
  "esportivo-2.jpg": "Camiseta Fitness Verde Musgo e Bermuda Preta",
  "esportivo-3.jpg": "Regata Cinza Canelada e Shorts Oliva Feminino",
  "esportivo-4.jpg": "Regata Vinho e Calça Jogger Preta Masculina",
  "esportivo-5.jpg": "Top e Legging Verde Petróleo Fitness Feminino",
  "esportivo-6.jpg": "Camiseta Preta e Bermuda Cargo Preta Masculina",
  "esportivo-7.jpg": "Blusa Manga Longa Laranja e Legging Azul Marinho",
  "esportivo-8.jpg": "Camisa Polo Azul Marinho e Calça Jogger Cinza",
  "esportivo-9.jpg": "Conjunto Fitness Rosa Antigo Top Legging e Jaqueta Bege",
  "esportivo-10.jpg": "Camiseta Mescla Cinza e Bermuda Preta Masculina",
  "esportivo-11.jpg": "Top Esportivo Azul-Petróleo e Legging Cinza Feminina",
  "esportivo-12.jpg": "Camiseta Dry-Fit Preta e Bermuda Azul Masculina",
  "esportivo-13.jpg": "Top Cropped Vinho e Legging Preta Estampada",
  "esportivo-14.jpg": "Moletom Cinza e Bermuda Esportiva Masculina",
  "esportivo-15.jpg": "Regata Esportiva Preta e Shorts Cinza Feminino",
  "esportivo-16.jpg": "Camiseta Dry-Fit Azul Claro Masculina",
  "esportivo-17.jpg": "Top e Legging Lilás Fitness Feminino",
  "esportivo-18.jpg": "Camiseta Esportiva Verde Oliva Masculina",
  "esportivo-19.jpg": "Conjunto Fitness Grafite Top e Legging Feminino",
  "esportivo-20.jpg": "Conjunto Fitness Preto Manga Longa e Legging",
  "esportivo-21.jpg": "Top Cinza Canelado e Legging Camuflada Feminina",
  "esportivo-22.jpg": "Conjunto Moletom com Capuz Preto Masculino",
  "esportivo-23.jpg": "Moletom Azul Mescla e Calça Jogger Preta Masculina",
  "esportivo-24.jpg": "Moletom Cinza e Bermuda Verde com Legging Preta",
  "esportivo-25.jpg": "Moletom Azul Mescla e Bermuda Preta Masculina",
  "esportivo-26.jpg": "Top Esportivo Preto e Legging Camuflada Feminina",
  "esportivo-27.jpg": "Conjunto Moletom com Zíper Preto Masculino",
  "esportivo-28.jpg": "Moletom Cinza Mescla e Bermuda com Legging Preta",
  "esportivo-29.jpg": "Moletom Azul Marinho e Bermuda Azul Masculina",
  "esportivo-30.jpg": "Moletom Colorblock Cinza e Bermuda Preta Masculina",
  "streetwear-1.jpg": "Camiseta Oversized Marrom e Jeans Destroyed",
  "streetwear-2.jpg": "Moletom Bege com Capuz e Bermuda Cargo Oliva",
  "streetwear-3.jpg": "Jaqueta Corta-Vento Cropped Preta e Calça Jogger Bege",
  "streetwear-4.jpg": "Jaqueta Track Estampada e Saia Plissada Preta",
  "streetwear-5.jpg": "Corta-Vento Verde Oliva com Detalhe Azul",
  "streetwear-6.jpg": "Moletom Grafite Estampa Harvard e Saia Jeans Midi",
  "streetwear-7.jpg": "Camisa Flanela Xadrez sobre Moletom Bege e Jeans Destroyed",
  "streetwear-8.jpg": "Colete Utility Preto e Calça Cargo Bege",
  "streetwear-9.jpg": "Suéter Marrom Oversized e Calça Estampada",
  "streetwear-10.jpg": "Jaqueta Varsity Azul Marinho e Calça Cargo Marrom",
  "streetwear-11.jpg": "Jaqueta Colorblock Roxo Verde e Jeans Wide Azul",
  "streetwear-12.jpg": "Camiseta Oversized Preta Estampada Streetwear",
  "streetwear-13.jpg": "Conjunto Techwear Tático All Black",
  "streetwear-14.jpg": "Camiseta Preta Básica e Calça Cargo Verde Oliva",
  "streetwear-15.jpg": "Jaqueta Jeans Patchwork e Bucket Hat Bege",
  "streetwear-16.jpg": "Moletom Preto Estampado e Jeans Destroyed",
  "streetwear-17.jpg": "Conjunto Agasalho Estampado Azul com Listras Brancas",
  "streetwear-18.jpg": "Colete Tricô Bege Listrado e Calça Oliva",
  "streetwear-19.jpg": "Look All Black Gola Alta e Calça Cargo Masculino",
  "streetwear-20.jpg": "Corta-Vento Estampado Chevron e Calça Track Azul",
  "streetwear-21.jpg": "Moletom Preto Estampa Gótica e Saia Cargo Preta",
  "streetwear-22.jpg": "Corta-Vento Colorblock Roxo Turquesa e Calça Cargo Oliva",
  "streetwear-23.jpg": "Jaqueta Jeans Oversized e Jeans Destroyed Feminino",
  "streetwear-24.jpg": "Jaqueta Puffer Bicolor Verde e Laranja",
  "streetwear-25.jpg": "Colete Utility Grafite e Moletom Bege Streetwear",
  "streetwear-26.jpg": "Camisa Flanela Xadrez sobre Moletom Oliva e Jeans Destroyed",
  "streetwear-27.jpg": "Top Cropped Preto e Calça Track Azul Marinho",
  "streetwear-28.jpg": "Colete Utilitário Verde Oliva e Calça Cargo Preta",
  "streetwear-29.jpg": "Trench Coat Bege e Conjunto Agasalho Verde Oliva",
  "streetwear-30.jpg": "Camisa Estampada Tropical e Bermuda Oliva Masculina",
  "acessorio-1.jpg": "Boné Verde Esportivo Masculino",
  "acessorio-2.jpg": "Brincos de Argola Dourados Trançados",
  "acessorio-3.jpg": "Bolsa Tiracolo Marrom com Fivela Dourada",
  "acessorio-4.jpg": "Conjunto Pulseiras de Miçangas Tons Terrosos",
  "acessorio-5.jpg": "Óculos de Sol Preto Clássico Masculino",
  "acessorio-6.jpg": "Colar Triplo Prateado com Pingente de Cristal",
  "acessorio-7.jpg": "Chapéu de Palha Bege Aba Média",
  "acessorio-8.jpg": "Anéis Finos Dourados Texturizados",
  "acessorio-9.jpg": "Boné Bege com Patch de Couro",
  "acessorio-10.jpg": "Colar de Pérolas Três Camadas Dourado",
  "acessorio-11.jpg": "Mochila de Couro Marrom Vintage",
  "acessorio-12.jpg": "Brincos de Argola Dourados Martelados",
  "acessorio-13.jpg": "Pulseiras Masculinas Prata e Relógio Couro",
  "acessorio-14.jpg": "Chapéu de Feltro Bege Aba Larga",
  "acessorio-15.jpg": "Lenço de Seda Estampado Abstrato",
  "acessorio-16.jpg": "Anéis Prata Ornamentados Masculinos",
  "acessorio-17.jpg": "Pulseira Rose Gold com Pingentes de Cristal",
  "acessorio-18.jpg": "Boné Cinza Grafite Básico Masculino",
  "acessorio-19.jpg": "Brincos de Argola Dourados Chunky",
  "acessorio-20.jpg": "Cinto de Couro Marrom com Fivela Dourada",
  "acessorio-21.jpg": "Relógio Prateado Clássico com Pulseira Aço",
  "acessorio-22.jpg": "Bolsa Tiracolo Couro Caramelo Retangular",
  "acessorio-23.jpg": "Touca Cinza e Óculos Aviador",
  "acessorio-24.jpg": "Corrente Prateada Malha Grumet Masculina",
  "acessorio-25.jpg": "Conjunto Pulseiras Couro Marrom e Metal Prata",
  "acessorio-26.jpg": "Chapéu Fedora Feltro Verde Oliva",
  "acessorio-27.jpg": "Mix de Anéis Boho com Pedra Âmbar",
  "acessorio-28.jpg": "Cachecol Tricô Texturizado Cinza Mescla",
  "acessorio-29.jpg": "Mochila de Lona Verde Oliva com Couro",
}

ROOT = Path(__file__).resolve().parent.parent
PATTERN = re.compile(
    r'(\{\s*nome:\s*")([^"]*)(".*?img:\s*"/produtos/([^"]+)"[^}]*\})',
    re.DOTALL,
)


def atualizar_arquivo(caminho: Path) -> int:
    texto = caminho.read_text(encoding="utf-8")
    count = 0

    def substituir(match: re.Match) -> str:
        nonlocal count
        prefixo, _nome_antigo, meio, arquivo = match.groups()
        novo = NOMES.get(arquivo)
        if novo is None:
            return match.group(0)
        count += 1
        return f'{prefixo}{novo}{meio}'

    novo_texto = PATTERN.sub(substituir, texto)
    if count:
        caminho.write_text(novo_texto, encoding="utf-8")
    return count


if __name__ == "__main__":
    total = 0
    for rel in ("public/catalogo.js", "index.html"):
        n = atualizar_arquivo(ROOT / rel)
        print(f"{rel}: {n} nomes atualizados")
        total += n
    print(f"Total: {total}")
