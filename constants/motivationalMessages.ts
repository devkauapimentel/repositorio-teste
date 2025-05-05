/**
 * Array of motivational messages displayed when completing tasks
 * These are shown randomly when a user completes a task
 */
export const motivationalMessages: string[] = [
  "Bom trabalho, amor! Você está 1 hora mais próximo(a) dos nossos sonhos.",
  "Muito bem! Cada tarefa realizada é um passo em direção à sua melhor versão.",
  "Que orgulho de você! Continue cuidando da sua rotina com tanto amor.",
  "Parabéns! Pequenas ações diárias criam grandes transformações.",
  "Você merece celebrar cada conquista! Este é mais um passo importante.",
  "Nossa, que dedicação! Você está construindo seus sonhos com cada tarefa concluída.",
  "Incrível! Seu compromisso com seu bem-estar é inspirador.",
  "Você está brilhando! Cada tarefa concluída é um ato de amor próprio.",
  "Que maravilha! Sua consistência diária está criando resultados extraordinários.",
  "Sensacional! Você está no caminho certo para alcançar tudo o que deseja.",
  "Hora de comemorar! Sua dedicação está transformando seus sonhos em realidade.",
  "Você é extraordinário(a)! Pequenas vitórias levam a grandes conquistas.",
  "Que talento para cuidar de si! Continue mantendo esse ritmo incrível.",
  "Excelente trabalho! Sua determinação é a chave para o seu sucesso.",
  "Sua dedicação é admirável! A jornada de autoamor fica mais forte a cada tarefa.",
  "Merecida conquista! Seu futuro agradece por cada ação positiva de hoje.",
  "Uau! Seu compromisso com suas metas é verdadeiramente inspirador.",
  "Uma celebração para você! Cada tarefa concluída é uma vitória no autoamor.",
  "Que conquista especial! Você está criando a vida que merece, um passo de cada vez.",
  "Magnífico! Seu cuidado consigo mesmo(a) está florescendo lindamente."
];

/**
 * Get a random motivational message from the array
 * @returns A randomly selected motivational message
 */
export const getRandomMessage = (): string => {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  return motivationalMessages[randomIndex];
};

export default getRandomMessage; 