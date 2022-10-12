# cryptoAPI

## 1. 프로젝트 소개

- Crypto API는 암호화폐(비트코인, 이더리움) 지갑 생성, 입/출금이 가능한 서비스입니다.
- Crypto API는 다음과 같은 기능을 지원합니다.

### 1. 비트코인

- 지갑 생성
- 지갑 잔고 확인
- 테스트 코인 테스트넷에서 얻기
- BTC 송금 트랜잭션 생성
- BTC 송금 트랜잭션 서명
- 서명된 트랜잭션을 비트코인 네트워크로 전파
- 처리된 트랜잭션 확인

🔨 테스트넷 지원: BlockCypher Testnet, Bitcoin Testnet

### 2. 이더리움

- 지갑 생성
- 지갑 잔고(ETH,ERC20 토큰) 확인
- ETH, ERC20토큰 송금 트랜잭션 생성
- 트랜잭션 서명
- 서명된 트랜잭션을 테스트 네트워크로 전파
- 처리된 트랜잭션을 확인

🔨 테스트넷 지원 : Sepolia Testnet, Goerli Testnet (**Ropsten Testnet 지원 중단으로 인해 Crypto API에서 지원하지 않습니다.**)  
🌈 ERC20 토큰 지원: sooho (현재 sooho token 한 가지만 지원합니다.)

보다 자세한 기능명세는 아래 API 명세 문서에서 확인할 수 있습니다.

### API 명세 문서:

### https://documenter.getpostman.com/view/20289299/2s83zdvmDb

## 2. 사용 방법

### 💻 **환경설정**

**패키지 설치**  
`$ yarn`

**테스트넷 설정**  
.env파일에서 환경변수값 변경으로 테스트넷 변경 가능 **(변경하지 않으면 default value로 설정됩니다.)**

btcCurrentChain = "bcy" // default value, 비트코인 blockCypher 테스트넷 사용  
btcCurrentChain = "btcTest" // bitcoin 테스트넷 사용

ethCurrentChain = "sepolia" // default value, 이더리움 sepolia 테스트넷 사용
ethCurrentChain = "goerli" // 이더리움 goerli 테스트넷 사용.

**.env 파일은 과제제출용으로 한시적으로 공개합니다.**

### 💻**서버 실행**

`$ yarn start`

### 💻**테스트 코드 실행**

❗️테스트 코드는 서버가 실행되지 않은 상태에서 실행시켜야 합니다.

**전체 테스트 코드 실행**  
`$ yarn test`

**비트코인 테스트코드만 실행**  
`$ yarn testbtc`

**이더리움 테스트코드만 실행**  
`$ yarn testeth`

## 주요 기술스택 및 라이브러리

- typescript
- node.js
- bitcoinjs-lib
- web3js
