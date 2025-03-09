import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Terms = () => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-loveblue min-h-screen"
    >
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-lovepink">
          {t("terms_of_service")}
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <p className="text-sm text-gray-600 mb-6">
            Última atualização: 07 de janeiro de 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">1. Aceitação dos Termos</h2>
            <p className="text-gray-700">
              Ao acessar e utilizar a nossa plataforma, você concorda em cumprir e ficar vinculado aos seguintes Termos de Uso. 
              Caso não concorde com qualquer parte destes termos, você não deve utilizar a plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">2. Descrição do Serviço</h2>
            <p className="text-gray-700">
              Nossa plataforma permite que casais criem uma página personalizada preenchendo um formulário com seu nome, 
              data de início do relacionamento, uma mensagem personalizada e até 7 fotos. Após o preenchimento, o casal é 
              direcionado para o checkout e, ao concluir o pagamento, recebe um link com um QR Code via email.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">3. Cadastro e Segurança</h2>
            <p className="text-gray-700">
              Para utilizar o serviço, você deve fornecer um endereço de email válido. 
              Não compartilharemos seu email com terceiros.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">4. Privacidade</h2>
            <p className="text-gray-700">
              Respeitamos a sua privacidade. Não utilizamos seus dados para qualquer tipo de processamento ou 
              venda de dados para terceiros. O email cadastrado é utilizado apenas para o envio do link da página personalizada.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">5. Conteúdo do Usuário</h2>
            <p className="text-gray-700">
              Você é responsável pelo conteúdo que insere na plataforma, incluindo fotos, mensagens e informações do relacionamento. 
              Não nos responsabilizamos por qualquer conteúdo impróprio ou ilegal carregado pelos usuários.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">6. Pagamentos e Reembolsos</h2>
            <p className="text-gray-700">
              Para usuários no Brasil, os pagamentos são processados através do Mercado Pago. Para usuários internacionais, 
              os pagamentos são processados através do Stripe. Após a conclusão do pagamento, o casal receberá um link para 
              a página personalizada via email. Não oferecemos reembolsos, exceto em casos excepcionais a nosso exclusivo critério.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">7. Modificações no Serviço</h2>
            <p className="text-gray-700">
              Nós nos comprometemos a manter o serviço ativo e disponível pelo período contratado, conforme o plano escolhido 
              (1 ano no plano básico ou tempo vitalício no plano avançado). No entanto, em circunstâncias excepcionais que 
              fujam ao nosso controle, como questões legais, técnicas ou financeiras, reservamo-nos o direito de modificar 
              ou descontinuar o serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">8. Limitação de Responsabilidade</h2>
            <p className="text-gray-700">
              Em nenhuma circunstância seremos responsáveis por qualquer dano indireto, incidental, especial ou consequente 
              decorrente de ou relacionado ao uso ou incapacidade de uso da plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">9. Alterações nos Termos</h2>
            <p className="text-gray-700">
              Podemos atualizar estes Termos de Uso periodicamente. Quando fizermos isso, revisaremos a data da 
              "última atualização" no topo desta página. É sua responsabilidade revisar estes Termos de Uso 
              periodicamente para se manter informado sobre quaisquer alterações.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">10. Contato</h2>
            <p className="text-gray-700">
              Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <ul className="list-none space-y-2 text-gray-700">
              <li>Email: </li>
              <li>Telefone: </li>
              <li>Responsável: </li>
              <li>Sede: Brasil</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Terms;