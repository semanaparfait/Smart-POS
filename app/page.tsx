import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Industries from './components/Industries';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Pricing from './components/Pricing';
import Testimonies from './components/Testimonies';
import CtaBanner from './components/CtaBanner';
import Footer from './components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen bg-white px-5">
      <Navbar />
      <Hero />
      <Industries />
      <Features />
      <HowItWorks />
      <Pricing />
      <Testimonies />
      <CtaBanner />
      <Footer />
    </main>
  );
}
