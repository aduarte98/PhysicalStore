import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ViaCepService {
  private readonly apiUrl = 'https://viacep.com.br/ws/';
  private readonly googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

  async getCoordinatesFromCep(cep: string): Promise<{ latitude: number; longitude: number }> {
    const sanitizedCep = cep.replace(/\D/g, '');
    if (sanitizedCep.length !== 8) {
      throw new Error('CEP inválido. Certifique-se de que contém 8 dígitos numéricos.');
    }
    const url = `${this.apiUrl}${sanitizedCep}/json/`;
    console.log(`URL: ${url}`);
    const { data } = await axios.get(url);
    console.log(`Dados do CEP: ${JSON.stringify(data)}`);

    if (data.erro) {
      throw new Error('CEP inválido');
    }

    const address = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
    const googleMapsUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.googleMapsApiKey}`;
    
    const response = await axios.get(googleMapsUrl);
    
    if (response.data.status !== 'OK' || !response.data.results[0]) {
      throw new Error('Não foi possível obter as coordenadas para o CEP');
    }

    const { lat, lng } = response.data.results[0].geometry.location;

    return {
      latitude: lat,
      longitude: lng,
    };
  }
}





