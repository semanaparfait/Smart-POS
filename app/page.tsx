import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Industries from './components/Industries';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Testimonies from './components/Testimonies';
import Faq from './components/Faq';
import CtaBanner from './components/CtaBanner';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="site min-h-screen bg-white text-ink">
      <Navbar />
      <Hero />
      <Industries />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonies />
      <Faq />
      <CtaBanner />
      <Footer />
    </main>
  );
}
