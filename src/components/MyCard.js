import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { RailRoad_Ticket_ABI, RailRoad_Ticket_ADDRESS, RailRoad_Card_ABI, RailRoad_Card_ADDRESS } from '../config'

function MyCard() {
  //définition des variables (getter, setter)
  const [address, setAdress] = useState();
  const [listUserCardsId, setListUserCardsId] = useState();
  const [bestDiscountPercent, setBestDiscountPercent] = useState();
  const [listUserCardsDetail, setListUserCardsDetail] = useState([]);

  //a la fin du chargement de la page on appelle la méthode getData()
  useEffect(() => {
    getData();
  }, [])

  //getData() permet de récupérer les variables issues du contrat et l'adresse de l'utilisateur
  async function getData() {
    //mise en place du provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    //récupération des contrats
    //const RailRoadTicket = new ethers.Contract(RailRoad_Ticket_ADDRESS, RailRoad_Ticket_ABI, provider);
    const RailRoadCard = new ethers.Contract(RailRoad_Card_ADDRESS, RailRoad_Card_ABI, provider);
    //récupération de l'utilisateur
    const signer = await provider.getSigner();
    //récupération de l'adresse de l'utilisateur
    const signerAddress = await signer.getAddress();
    //récupération du nombre de tickets de l'utilisateur, du prix du tickets et de la réduction qui sera aplliqué
    const listUserCardsId = await RailRoadCard.listUserCards(signerAddress);
    const DiscountPercent = await RailRoadCard.getBiggestReduct(signerAddress);
    
    for (const i of listUserCardsId) {
      const card_Detail = await RailRoadCard.discountCards(i)
      setListUserCardsDetail((item) => [
        ...item,
        {
          id: String(card_Detail.id),
          name: card_Detail.name,
          discountPercent: String(card_Detail.discountPercent),
          available: card_Detail.available,
          owner: card_Detail.owner,
          price: String(card_Detail.price),
          description: card_Detail.description,
          image_url: card_Detail.image_url
        }
      ])
    }

    //sauvegarde des valeurs dans les variables
    setAdress(signerAddress);
    setListUserCardsId(String(listUserCardsId));
    setBestDiscountPercent(String(DiscountPercent));
  }

  async function refreshPage() {
    window.location.reload()
  }

  //rendu HTML
  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex justify-content-center">
            <div id="content">
              <p>Votre adresse : {address}</p>
              <p>pourcentage de réduction appliqué (meilleur) : {bestDiscountPercent} %</p>              

              {listUserCardsDetail.map((item) => (
              <div key={item.id} className="alert-info mt-5 rounded-xl py-2 px-4">
                <div>
                  <p>Id : {item.id}</p>
                  <p>nom : {item.name}</p>
                  <p>pourcentage de réduction : {item.discountPercent}</p>
                  <p>disponible a la vente : {item.available}</p>
                  <p>propriétaire : {item.owner}</p>
                  <p>prix : {item.price}</p>
                  <img src={item.image_url} width={250} height={250} alt="new"/>
                </div>
              </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default MyCard;