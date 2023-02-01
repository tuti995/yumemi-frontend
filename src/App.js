import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Legend,
  Line,
} from 'recharts'

const endpointURL = 'https://opendata.resas-portal.go.jp/'
const prefecturesURL = `${endpointURL}api/v1/prefectures`
const populationURL = `${endpointURL}api/v1/population/composition/perYear?cityCode=-&prefCode=`

function App() {
  const [prefecturesItems, setPrefecturesItems] = useState([])
  const [checkedNames, setCheckedNames] = useState('')
  const [checkedValues, setCheckedValues] = useState('')
  const [populationItems, setPopulationItems] = useState([])
  const [isChecked, setIsChecked] = useState(false)
  const getPrefecturesData = useCallback(() => {
    fetch(
      prefecturesURL,
      { headers: { 'x-api-key': process.env.REACT_APP_API_KEY } }
    )
      .then((response) => response.json())
      .then((data) => {
        setPrefecturesItems(data.result)
        console.log(data)
      })
  }, [setPrefecturesItems])

  const getPopulationsData = useCallback(
    (prefCode, prefName) => {
      fetch(
        populationURL + prefCode,
        { headers: { 'x-api-key': process.env.REACT_APP_API_KEY } }
      )
        .then((response) => response.json())
        .then((data) => {
          const dataResult = data.result.data.filter(
            (e) => e.label === '総人口'
          )[0].data
          setPopulationItems((prevPopulationItems) => [
            ...prevPopulationItems,
            { prefName, dataResult },
          ])
        })
    },
    [setPopulationItems]
  )

  const deletePopulationsData = useCallback(
    (prefCode) => {
      setPopulationItems((prevPopulationItems) =>
        prevPopulationItems.filter(
          (prefCodeValue) => prefCodeValue.prefCode !== prefCode
        )
      )
    },
    [setPopulationItems]
  )

  const LineChartPopulationItems = useMemo(() => {
    return populationItems.reduce((result, item) => {
      item.dataResult.forEach((ojt) => {
        if (!result[ojt.year]) {
          result[ojt.year] = { year: ojt.year }
        }
        result[ojt.year][item.prefName] = ojt.value
      })
      return result
    }, [])
  }, [populationItems])

  useEffect(() => {
    getPrefecturesData()
  }, [])

  useEffect(() => {
    if (!isChecked) return
    getPopulationsData(checkedNames, checkedValues)
  }, [getPopulationsData, checkedNames, checkedValues, isChecked])

  useEffect(() => {
    if (isChecked) return
    deletePopulationsData(checkedNames)
  }, [deletePopulationsData, checkedNames, isChecked])

  const renderLineChart = populationItems.map((populationItem, index) => {
    return (
      <>
        <Line
          key={index}
          type="monotone"
          dataKey={populationItem.prefName}
          stroke="#8884d8"
        />
      </>
    )
  })
  const cleanLineChartPopulationItems = LineChartPopulationItems.filter(Boolean)

  return (
    <div className="App">
      <div className="check_wrap">
        {prefecturesItems.map(
          (
            prefecturesItem,
            index
          ) => (
            <label key={index}>
              <input
                type="checkbox"
                name={prefecturesItem.prefCode}
                value={`${prefecturesItem.prefName}`}
                onChange={(event) => {
                  setCheckedNames(event.target.name)
                  setCheckedValues(event.target.value)
                  setIsChecked(event.target.checked)
                }}
              />
              {prefecturesItem.prefName}
            </label>
          )
        )}
      </div>
      <div>
        <LineChart
          width={600}
          height={300}
          data={cleanLineChartPopulationItems}
          margin={{ top: 5, right: 20, bottom: 5, left: 30 }}
        >
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="year" />
          <YAxis />
          <Legend />
          {renderLineChart}
        </LineChart>
      </div>
    </div>
  )
}

export default App
