import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ReactTypingEffect from 'react-typing-effect';
import { FaRocket, FaTelegramPlane } from 'react-icons/fa';

const HeroContainer = styled.section`
  height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding-top: 80px;
`;

const HeroContent = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  
  @media (max-width: 992px) {
    flex-direction: column;
    justify-content: center;
    text-align: center;
  }
`;

const HeroText = styled.div`
  max-width: 600px;
  z-index: 1;
  
  @media (max-width: 992px) {
    margin-bottom: 40px;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: 3.5rem;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  
  span {
    display: block;
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled(motion.p)`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: var(--text-secondary);
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const ButtonContainer = styled(motion.div)`
  display: flex;
  gap: 20px;
  
  @media (max-width: 992px) {
    justify-content: center;
  }
  
  @media (max-width: 480px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const PrimaryButton = styled(motion.button)`
  background: var(--gradient-primary);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    font-size: 1.2rem;
  }
`;

const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: white;
  border: 2px solid var(--primary);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  
  svg {
    font-size: 1.2rem;
  }
`;

const HeroImageContainer = styled(motion.div)`
  max-width: 500px;
  width: 100%;
  z-index: 1;
  
  @media (max-width: 992px) {
    max-width: 400px;
  }
`;

const HeroImage = styled.div`
  position: relative;
  padding: 20px;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 16px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  }
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 20px;
    padding: 2px;
    background: var(--gradient-primary);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
`;

const BackgroundElement = styled.div`
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(65, 97, 255, 0.2) 0%, rgba(15, 22, 36, 0) 70%);
  width: 70vw;
  height: 70vw;
  top: 10%;
  right: -20%;
  z-index: 0;
`;

const TypedContainer = styled.div`
  height: 4rem;
  margin-bottom: 1rem;
  font-weight: 700;
  font-size: 1.5rem;
  
  span {
    background: var(--gradient-primary);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    height: 3rem;
  }
`;

const Hero = () => {
  return (
    <HeroContainer id="home">
      <BackgroundElement />
      
      <HeroContent>
        <HeroText>
          <HeroTitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            MultiversX <span>Warp Generator</span>
          </HeroTitle>
          
          <TypedContainer>
            <ReactTypingEffect
              text={[
                "Stake 10 EGLD with validator...",
                "Swap 1 EGLD for USDC at the best rate...",
                "Borrow 500 USDC with 2 EGLD as collateral...",
                "Mint an NFT for 0.5 EGLD from collection X..."
              ]}
              speed={70}
              eraseSpeed={30}
              typingDelay={1000}
              eraseDelay={2000}
            />
          </TypedContainer>
          
          <HeroSubtitle
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Create blockchain transactions using natural language prompts. Generate shareable links and QR codes that anyone can use to execute your transactions. Available on web and Telegram.
          </HeroSubtitle>
          
          <ButtonContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <PrimaryButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('http://localhost:3000', '_blank')}
            >
              <FaRocket /> Launch App
            </PrimaryButton>
            
            <SecondaryButton
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://t.me/WarpX_bot', '_blank')}
            >
              <FaTelegramPlane /> Try on Telegram
            </SecondaryButton>
          </ButtonContainer>
        </HeroText>
        
        <HeroImageContainer
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <HeroImage>
            <img src="https://i.imgur.com/YKH7fjG.png" alt="MultiversX Warp Generator" />
          </HeroImage>
        </HeroImageContainer>
      </HeroContent>
    </HeroContainer>
  );
};

export default Hero; 