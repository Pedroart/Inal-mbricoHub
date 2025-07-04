import { SensorService } from '../sensorService';

describe('SensorService', () => {
  it('Inserta y recupera sensores', () => {
    const sensor = {
      externalId: 202,
      nickname: 'Test',
      fullName: 'Sensor Test',
    };

    const inserted = SensorService.addSensor(sensor);
    expect(inserted).toBe(true);

    const all = SensorService.getSensores();
    expect(all.length).toBe(1);
    expect(all[0].externalId).toBe(202);
  });

  it('Obtiene sensor por externalId', () => {
    SensorService.addSensor({
      externalId: 303,
      nickname: 'ExtID',
      fullName: 'Sensor ExtID',
    });

    const found = SensorService.getSensorByExternalId(303);
    expect(found).not.toBeNull();
    expect(found?.nickname).toBe('ExtID');
  });

  it('Actualiza sensor correctamente', () => {
    SensorService.addSensor({
      externalId: 404,
      nickname: 'Old',
      fullName: 'Old Name',
    });

    const sensor = SensorService.getSensorByExternalId(404);
    expect(sensor!.id).not.toBeNull();

    const updated = SensorService.updateSensor({
      id: sensor!.id,
      externalId: 404,
      nickname: 'Updated',
      fullName: 'New Name',
    });

    expect(updated).toBe(true);

    if (sensor && sensor.id !== null) {
      const updatedSensor = SensorService.getSensorById(sensor.id as number);
      expect(updatedSensor?.nickname).toBe('Updated');
    } else {
      throw new Error('Sensor id is undefined');
    }
  });

  it('Devuelve null si no existe ID', () => {
    const notFound = SensorService.getSensorById(9999);
    expect(notFound).toBeNull();
  });

  it('Devuelve false al intentar actualizar sin ID válido', () => {
    const result = SensorService.updateSensor({
      id: 9999,
      externalId: 500,
      nickname: 'Fake',
      fullName: 'No existe',
    });
    expect(result).toBe(false);
  });
});