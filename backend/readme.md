### Instalando o projeto

Instale o projeto em seu ambiente de desenvolvimento seguindo as etapas a seguir.

1. No Shell, clonar o repositório do projeto em seu PC.

```shell
git clone https://github.com/lendrw/API-vendas.git
```

2. No Shell, acessar a pasta do projeto e instalar as dependências com o `Npm`.

```shell
cd

npm ci
```

3. No Shell, executar o comando `code .` para abrir o Visual Studio Code com o projeto carregado.

4. Criar o arquivo de variaveis de ambiente `.env` na pasta raiz do projeto, incluindo o conteúdo a seguir:

```shell
# Application
PORT=3333
API_URL=http://localhost:3333
```

### Executando o projeto

O projeto inicial contém apenas o arquivo `server.ts` com o um `console.log`. Executar o servidor e observar a mensagem `Olá Dev!` no console do shell:

```shell
npm run dev
```
