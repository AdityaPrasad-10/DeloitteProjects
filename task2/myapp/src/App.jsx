import { useForm } from '@mantine/form';
import { TextInput, Button, Group, Box, MantineProvider, Select, Paper, Grid, ActionIcon } from '@mantine/core';
import { randomId } from '@mantine/hooks';
import {IconTrash} from '@tabler/icons-react';
import { useState } from "react";

function App() {

    const [rows,setRows]= useState([
      {id:Date.now()},
    ]);
  const selectData= ['React','Angular','Svelte','Vue'];  
  const addRow=() =>{
    setRows([...rows,{id: Date.now()}]);
  };
  
  const deleteRow = (id) => {
  if (rows.length === 1) return;
  setRows(rows.filter((row) => row.id !== id));
};

 

  return (
    <MantineProvider>
        <h2>&nbsp;&nbsp;&nbsp;&nbsp;Cell Coverage</h2>
        <h3 style={{color:'grey'}}>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;If the provider has multiple countries or categories, please specify; Otherwise leave blank.
        </h3>
      <Box w="100%" px="xl" mt="xl">
        <Paper withBorder p="xl" radius="xl">
        {rows.map((row)=>(

          <Grid key={row.id} align="flex-end" mb="md">
            <Grid.Col span={3}>
              <Select
                label="Country"
                placeholder="Select any Country"
                searchable
                data={['Canada', 'Australia', 'USA', 'France']}
                />
            </Grid.Col>

            <Grid.Col span={3}>
              <Select
                label="Category"
                placeholder="Select any Category"
                searchable
                data={['Deodorants', 'Angular', 'Svelte', 'Vue']}
                />
            </Grid.Col>

            <Grid.Col span={3}>
              <Select
                label="Country Code"
                placeholder="Select any Country Code"
                searchable
                data={['CA', 'AUS', 'FRA', 'USA']}
                />
            </Grid.Col>

            <Grid.Col span={2.7}>
              <Select
                label="Source Extract Name"
                placeholder="Select any Source Extract Name"
                searchable
                data={['CA_UNILEVER_DEODARANTS', 'Chocolates', 'Coffee', 'Tea']}
                />
            </Grid.Col>
            <Grid.Col span={0.3}>
                <ActionIcon
                  color="red"
                  variant="outline"
                  onClick={() => deleteRow(row.id)} >
                  <IconTrash size={18} />
                </ActionIcon>
              </Grid.Col>
          </Grid>
      ))}

<Button color="blue" radius="md" variant="outline" onClick={addRow}>
            + Add Row
          </Button>

      </Paper>
      </Box>
    </MantineProvider>
  );
}

export default App;
