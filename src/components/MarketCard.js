import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { RailRoad_Ticket_ABI, RailRoad_Ticket_ADDRESS, RailRoad_Card_ABI, RailRoad_Card_ADDRESS } from '../config'

function MarketCard() {
  //définition des variables (getter, setter)
  const [address, setAdress] = useState();
  const [listAvailableCardsId, setListAvailableCardsId] = useState();
  const [listAvailableCardsDetail, setListAvailableCardsDetail] = useState([]);

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
    //récupération de la liste des Id des cartes disponible a l'achat
    const listAvailableCardsId = await RailRoadCard.listAvailableCards();
    
    //on parcours la liste des Id
    for (const i of listAvailableCardsId) {
      //on récupère le détail de la carte en fonction de i
      const card_Detail = await RailRoadCard.discountCards(i)
      //on enregistre le résultat
      setListAvailableCardsDetail((item) => [
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
    setListAvailableCardsId(String(listAvailableCardsId));
  }
  
  //refresh de la page
  async function refreshPage() {
    window.location.reload()
  }

  //CardBuy permet l'achat de Carte
  async function CardBuy(e) {
    //récupération des valeurs données dans la balise <Form>
    e.preventDefault();
    const data = new FormData(e.target);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const RailRoadCard = new ethers.Contract(RailRoad_Card_ADDRESS, RailRoad_Card_ABI, signer);

    try {
      //appelle de la méthode discountCards pour récupérer le prix dans les informations de la carte
      const card_Detail = await RailRoadCard.discountCards(data.get("CardId"));

      //appelle de la méthode du contrat qui permet l'achat de tickets
      const transaction = await RailRoadCard.buyDiscountCard(data.get("CardId"), { value: card_Detail.price });

      //quand la transaction est terminé on appelle la méthode refreshPage()
      await transaction.wait();
      refreshPage();
    }
    catch (err) {
      console.log(err);
      alert(err);
    }

  }

  //rendu HTML
  return (
    <div>
      <div className="container-fluid">
        <div className="row">
          <main role="main" className="col-lg-12 d-flex justify-content-center">
            <div id="content">
              <form onSubmit={CardBuy}>
                Voulez vous acheter une carte :
                <div className="my-3">
                  <input
                    type="text"
                    name="CardId"
                    className="input input-bordered block w-full focus:ring focus:outline-none"
                    placeholder="Id de la carte"
                  />
                </div>
                <footer className="p-4">
                  <button
                    type="submit"
                    className="btn btn-primary submit-button focus:ring focus:outline-none w-full"
                  >
                    Acheter la carte
                  </button>
                </footer>
              </form>

              {listAvailableCardsDetail.map((item) => (
                <div>
                  {item.id != 1 &&
                  //on n'affiche pas la carte qui a pour Id 1, c'est une carte "fictive" qui n'est pas censé être utilisé
                    <div key={item.id} className="alert-info mt-5 rounded-xl py-2 px-4">
                        <div>
                          <p>Id : {item.id}</p>
                          <p>nom : {item.name}</p>
                          <p>pourcentage de réduction : {item.discountPercent}</p>
                          <p>propriétaire : {item.owner}</p>
                          <p>prix : {item.price}</p>
                          <img src={item.image_url} width={250} height={250} alt="new"/>
                        </div>
                    </div>
                  }
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );

}

export default MarketCard;