const { create } = require("ipfs-http-client");

const ipfs = create("https://ipfs.infura.io:5001");

export default async function ipfsUpload(name, recipe, image) {
  const result = await ipfs.add(image);
  let imagePath = `https://gateway.ipfs.io/ipfs/${result.path}`;
  const files = [
    {
      path: "/",
      content: JSON.stringify({
        name: name,
        attributes: recipe.map((ingredient) => {
          return {
            trait_type: ingredient.name,
            value: ingredient.quantity,
          };
        }),

        image: imagePath,
        description: `Recipe for ${name}`,
      }),
    },
  ];

  const result = await ipfs.add(files);
  console.log(result);
  return result.path;
}
