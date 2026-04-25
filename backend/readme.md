### Installing the project

Install the project in your development environment by following the steps below.

1. In the shell, clone the project repository to your computer.

```shell
git clone https://github.com/lendrw/API-vendas.git
```

2. In the shell, access the project folder and install the dependencies with `npm`.

```shell
cd

npm ci
```

3. In the shell, run the `code .` command to open Visual Studio Code with the project loaded.

4. Create the `.env` environment variables file in the project root folder, including the content below:

```shell
# Application
PORT=3333
API_URL=http://localhost:3333
```

### Running the project

The initial project contains only the `server.ts` file with a `console.log`. Run the server and check the greeting message in the shell console:

```shell
npm run dev
```
