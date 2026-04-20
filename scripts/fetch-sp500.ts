type Ranking = {
    id: number;
    code: string;
    name: string;
    price: number;
    change_rate: number;
    change_value: number;
    market: "jp" | "us";
    rank_type?: string;
    created_at?: string;
  };