import {useState, useEffect} from "react"
import "./App.css"

const API_ENDPOINT = "https://min-api.cryptocompare.com/data/price"
const API_KEY =
    "e314c777eafdccf46470f29a7ff17061ab9cd29efe04e8f69dd96a7fba7778e4"

const App = () => {
    const [searchText, setSearchText] = useState("")
    const [currencies, setCurrencies] = useState([])

    useEffect(() => {
        const storedCurrencies = JSON.parse(localStorage.getItem("currencies"))
        if (storedCurrencies) {
            setCurrencies(storedCurrencies)
        } else {
            setCurrencies([{name: "DOGE", exchangeRate: "", delta: 0}])
        }
    }, [])

    async function handleAddCrypto(e) {
        e.preventDefault()

        const cryptoName = searchText.trim().toUpperCase()

        if (currencies.find((currency) => currency.name === cryptoName)) {
            setSearchText("")
            return
        }

        const exchangeRate = await getExchangeRate(cryptoName)

        if (!exchangeRate) {
            setSearchText("")
            return
        }

        const newCurrency = {
            name: cryptoName,
            exchangeRate: exchangeRate.toFixed(2),
            delta: 0,
        }

        const updatedCurrencies = [...currencies, newCurrency]
        setCurrencies(updatedCurrencies)
        localStorage.setItem("currencies", JSON.stringify(updatedCurrencies))
        setSearchText("")
    }

    function handleRemoveCrypto(name) {
        const updatedCurrencies = currencies.filter(
            (currency) => currency.name !== name
        )
        setCurrencies(updatedCurrencies)
        localStorage.setItem("currencies", JSON.stringify(updatedCurrencies))
    }

    async function updateCurrencies() {
        const updatedCurrencies = await Promise.all(
            currencies.map(async (currency) => {
                const exchangeRate = await getExchangeRate(currency.name)

                if (!exchangeRate) {
                    return currency
                }

                const delta = exchangeRate - currency.exchangeRate
                return {
                    name: currency.name,
                    exchangeRate: exchangeRate.toFixed(2),
                    delta: delta.toFixed(2),
                }
            })
        )

        setCurrencies(updatedCurrencies)
        localStorage.setItem("currencies", JSON.stringify(updatedCurrencies))
    }

    async function getExchangeRate(cryptoName) {
        const url = `${API_ENDPOINT}?fsym=${cryptoName}&tsyms=USD&api_key=${API_KEY}`
        const response = await fetch(url)

        if (!response.ok) {
            return null
        }

        const data = await response.json()
        return data.USD
    }

    useEffect(() => {
        let intervalId

        if (currencies.length !== 0) {
            intervalId = setInterval(updateCurrencies, 5000)
        }

        return () => clearInterval(intervalId)
    }, [currencies])

    return (
        <div className="crypto-tracker">
            <h1 className="crypto-tracker__title">Crypto Tracker</h1>
            <form className="crypto-tracker__form" onSubmit={handleAddCrypto}>
                <label className="crypto-tracker__label" htmlFor="search">
                    Search for a cryptocurrency:
                </label>
                <input
                    className="crypto-tracker__input"
                    type="text"
                    id="search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                />
                <button className="crypto-tracker__button" type="submit">
                    Search
                </button>
            </form>
            <h2 className="crypto-tracker__subtitle">My Cryptocurrencies</h2>
            <ul className="crypto-tracker__list">
                {currencies.map((currency) => (
                    <li className="crypto-tracker__item" key={currency.name}>
                        <span className="crypto-tracker__name">
                            {currency.name}: ${currency.exchangeRate}
                        </span>
                        <span
                            className="crypto-tracker__delta"
                            style={{
                                color: currency.delta > 0 ? "green" : "red",
                            }}
                        >
                            {currency.delta > 0 ? "▲" : "▼"}
                            {currency.delta}
                        </span>
                        {
                            <button
                                className="crypto-tracker__delete-button"
                                onClick={() =>
                                    handleRemoveCrypto(currency.name)
                                }
                            >
                                Delete
                            </button>
                        }
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default App
