import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const Privacy = () => {
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
          {t("privacy_policy")}
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <p className="text-sm text-gray-600 mb-6">
            Última atualização: 07 de janeiro de 2025
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">1. Introdução</h2>
            <p className="text-gray-700">
              Sua privacidade é importante para nós. Esta Política de Privacidade descreve como coletamos, 
              usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">2. Informações que Coletamos</h2>
            <p className="text-gray-700">
              Coletamos as seguintes informações quando você utiliza nossa plataforma:
            </p>
            <ul className="list-disc pl-6 text-gray-700">
              <li><strong>Informações de Cadastro:</strong> Nome, data de início do relacionamento, 
              mensagem personalizada, fotos do casal e endereço de email cadastrado.</li>
              <li><strong>Informações de Pagamento:</strong> Endereço de email cadastrado no 
              Mercado Pago (Brasil) ou Stripe (internacional) para processamento do pagamento e 
              envio do link da página personalizada.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">3. Como Usamos Suas Informações</h2>
            <p className="text-gray-700">Utilizamos suas informações para:</p>
            <ul className="list-disc pl-6 text-gray-700">
              <li>Processar o pagamento e enviar o link da página personalizada via email.</li>
              <li>Personalizar e criar a página do casal com as informações fornecidas.</li>
              <li>Melhorar nossos serviços e suporte ao cliente.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">4. Compartilhamento de Informações</h2>
            <p className="text-gray-700">
              Não compartilhamos suas informações pessoais com terceiros, exceto conforme necessário 
              para processar pagamentos (Mercado Pago ou Stripe) e conforme exigido por lei.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">5. Segurança</h2>
            <p className="text-gray-700">
              Implementamos medidas de segurança para proteger suas informações pessoais contra acesso, 
              uso ou divulgação não autorizados. No entanto, nenhuma transmissão de dados pela internet 
              é completamente segura, e não podemos garantir a segurança absoluta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">6. Retenção de Dados</h2>
            <p className="text-gray-700">
              Reteremos suas informações pessoais apenas pelo tempo necessário para cumprir as 
              finalidades para as quais foram coletadas ou conforme exigido por lei.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">7. Seus Direitos</h2>
            <p className="text-gray-700">
              Você tem o direito de acessar, corrigir ou excluir suas informações pessoais. 
              Para exercer esses direitos, entre em contato conosco através das informações 
              fornecidas na seção de contato.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">8. Alterações nesta Política de Privacidade</h2>
            <p className="text-gray-700">
              Podemos atualizar esta Política de Privacidade periodicamente. Quando fizermos isso, 
              revisaremos a data da "última atualização" no topo desta página. É sua responsabilidade 
              revisar esta política periodicamente para se manter informado sobre quaisquer alterações.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-lovepink">9. Contato</h2>
            <p className="text-gray-700">
              Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco:
            </p>
            <ul className="list-none space-y-2 text-gray-700">
              <li><strong>Email:</strong> </li>
              <li><strong>Telefone:</strong> </li>
              <li><strong>Responsável:</strong> </li>
              <li><strong>Sede:</strong> Brasil</li>
            </ul>
          </section>
        </div>
      </main>
      <Footer />
    </motion.div>
  );
};

export default Privacy;
