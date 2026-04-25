export async function getCityWeather(city: string) {
  const res = await fetch(`http://localhost:5000/api/weather/${city}`);
  return res.json();
}