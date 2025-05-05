# 🌸 Rotina de Autoamor App

Um aplicativo de produtividade e espiritualidade para organizar suas rotinas de autocuidado, atividades diárias e práticas espirituais em um formato de quadro estilo Trello.

## 📱 Funcionalidades

- Quadros personalizáveis estilo Trello
- Listas de tarefas organizadas por categoria (Pessoal, Estudos, Espiritual, etc.)
- Tarefas com opções de data, imagem e descrição
- Design inspirador com foco em bem-estar
- Funciona completamente offline
- Salva automaticamente todas as alterações

## 🛠️ Tecnologias

- React Native / Expo
- TypeScript
- AsyncStorage para persistência local
- Expo Router para navegação
- Componentes e temas personalizados

## 📋 Requisitos

- Node.js 14.x ou superior
- npm ou yarn
- Expo CLI

## 🚀 Instalação e Execução

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/app-rotina-autoamor.git
cd app-rotina-autoamor
```

### 2. Instalar dependências

```bash
npm install
# ou
yarn install
```

### 3. Iniciar o aplicativo com Expo

```bash
npx expo start
```

Isso abrirá o Metro Bundler em seu navegador. Você pode então:
- Escanear o QR code com o aplicativo Expo Go no seu dispositivo Android ou iOS
- Pressionar 'a' para abrir no emulador Android
- Pressionar 'i' para abrir no simulador iOS

## 📲 Gerando APK para Android

Para gerar um arquivo APK para distribuição:

1. Certifique-se de ter a CLI do EAS instalada:

```bash
npm install -g eas-cli
```

2. Faça login na sua conta Expo:

```bash
eas login
```

3. Configure o projeto para builds (caso ainda não tenha feito):

```bash
eas build:configure
```

4. Gere um APK para Android:

```bash
eas build --platform android --profile preview
```

O comando acima vai gerar um APK no modo preview, que é mais rápido de construir e ideal para testes. Quando estiver pronto para a versão de produção, use:

```bash
eas build --platform android
```

## 📄 Comandos Úteis

- `npx expo start` - Inicia o servidor de desenvolvimento
- `npx expo start --clear` - Inicia limpando o cache
- `npm run reset-project` - Limpa o cache do projeto (útil quando há erros)
- `npm run android` - Inicia no emulador Android
- `npm run ios` - Inicia no simulador iOS
- `npm run web` - Inicia em modo web

## 🧠 Estrutura do Projeto

```
app-rotina-autoamor/
├── app/                  # Pasta principal do app (Expo Router)
│   ├── (tabs)/           # Navegação principal com tabs
│   │   ├── home.tsx      # Tela inicial
│   │   ├── calendar.tsx  # Calendário
│   │   ├── prayer.tsx    # Área espiritual
│   │   └── profile.tsx   # Perfil do usuário
│   ├── _layout.tsx       # Layout principal
│   └── index.tsx         # Entrada do app
├── assets/               # Recursos estáticos (imagens, fontes)
├── components/           # Componentes reutilizáveis
│   ├── BoardUpdated.tsx  # Quadro principal estilo Trello
│   ├── TaskList.tsx      # Listas de tarefas
│   ├── TaskCard.tsx      # Cards de tarefas
│   └── ...
├── constants/            # Constantes e temas
├── hooks/                # Custom hooks
│   └── useStorage.ts     # Gerenciamento de dados local
└── ...
```

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou enviar pull requests.

## 📝 Licença

Este projeto está licenciado sob a licença MIT. 